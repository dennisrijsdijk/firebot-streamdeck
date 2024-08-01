import { JsonValue } from "@elgato/streamdeck";
import { ApiCommand, ApiCounter, ApiCustomRole, ApiCustomVariableBody, ApiPresetEffectList, ApiQueue, ApiTimer } from "../../types/api";
import ApiBase from "./apiBase";
import FirebotCommand from "./routes/command";
import FirebotCounter from "./routes/counter";
import FirebotCustomRole from "./routes/customRole";
import FirebotQueue from "./routes/queue";
import FirebotPresetEffectList from "./routes/presetEffectList";
import FirebotTimer from "./routes/timer";

export class ApiClient extends ApiBase {
    constructor(endpoint: string) {
        super(endpoint);
    }

    async isOnline(): Promise<boolean> {
        if (this.baseEndpoint === null) {
            return false;
        }

        try {
            await fetch(`${this.baseEndpoint}/status`, this.abortSignal);
            return true
        } catch (error) {
            return false;
        }
    }

    async getCommands() {
        const customCommands = await this.getCustomCommands();
        const systemCommands = await this.getSystemCommands();
        return {
            ...systemCommands,
            ...customCommands
        }
    }

    private async getCustomCommands() {
        return this.objectFetch<ApiCommand, FirebotCommand>("commands/custom", (command) => {
            return [command.id, new FirebotCommand(command, "custom", this.baseEndpoint)];
        });
    }

    private async getSystemCommands() {
        return this.objectFetch<ApiCommand, FirebotCommand>("commands/system", (command) => {
            return [command.id, new FirebotCommand(command, "system", this.baseEndpoint)];
        });
    }

    async getCounters() {
        return this.objectFetch<ApiCounter, FirebotCounter>("counters", (counter) => {
            return [counter.id, new FirebotCounter(counter, this.baseEndpoint)];
        });
    }

    async getCustomRoles() {
        return this.objectFetch<ApiCustomRole, FirebotCustomRole>("customRoles", (role) => {
            return [role.id, new FirebotCustomRole(role, this.baseEndpoint)];
        });
    }

    async getCustomVariables(): Promise<Record<string, JsonValue>> {
        if (this.baseEndpoint == null) {
            return {};
        }
        const result = await fetch(`${this.baseEndpoint}/custom-variables`, this.abortSignal);
        const variables = await result.json() as Record<string, ApiCustomVariableBody>;
        if (typeof variables === "object" && variables != null) {
            const finalVariables: Record<string, JsonValue> = {};
            Object.keys(variables).forEach(key => finalVariables[key] = variables[key].v);
            return finalVariables;
        }
        return { };
    }

    async setCustomVariable(name: string, data: JsonValue, ttl = 0) {
        if (this.baseEndpoint == null) {
            return false;
        }
        try {
            await fetch(`${this.baseEndpoint}/custom-variables/${encodeURIComponent(name)}`, {
                ...this.abortSignal,
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data,
                    ttl
                })
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async setCustomVariableWithPath(name: string, data: JsonValue, existingData: JsonValue, propertyPath: string, ttl = 0) {
        if (this.baseEndpoint == null || existingData == null) {
            return false;
        }

        try {
            let cursor = existingData;
            // regex: match . but not \.
            const nodes: (string | number)[] = propertyPath.split(/(?<!\\)\./gm);
            for (let idx = 0; idx < nodes.length; idx++) {
                let node = nodes[idx];
                (node as string).replace("\\.", ".");
                if (!isNaN(Number(node))) {
                    node = Number(node);
                }

                if (idx !== nodes.length - 1) {
                    cursor = cursor[node];

                    if (cursor == null) {
                        return false;
                    }

                    continue;
                }

                if (Array.isArray(cursor[node]) && !Array.isArray(data)) {
                    cursor[node].push(data);
                } else {
                    cursor[node] = data;
                }
            }

            return this.setCustomVariable(name, existingData, ttl);
        } catch (error) {
            return false;
        }
    }

    async getEffectQueues() {
        return this.objectFetch<ApiQueue, FirebotQueue>("queues", (queue) => {
            return [queue.id, new FirebotQueue(queue, this.baseEndpoint)];
        });
    }

    async getPresetEffectLists() {
        return this.objectFetch<ApiPresetEffectList, FirebotPresetEffectList>("effects/preset", (list) => {
            return [list.id, new FirebotPresetEffectList(list, this.baseEndpoint)];
        });
    }

    async getTimers() {
        return this.objectFetch<ApiTimer, FirebotTimer>("timers", (timer) => {
            return [timer.id, new FirebotTimer(timer, this.baseEndpoint)];
        });
    }
}