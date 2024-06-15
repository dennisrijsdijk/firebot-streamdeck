import ApiBase from "./apiBase";
import { FirebotCommandData, FirebotInstanceData, FirebotInstanceStatus } from "../../types/firebot";
import FirebotCounter from "./routes/counter";
import FirebotQueue from "./routes/queue";
import {
    ApiCommand,
    ApiCounter,
    ApiCustomRole,
    ApiCustomVariableBody,
    ApiPresetEffectList,
    ApiQueue,
    ApiTimer
} from "../../types/api";
import FirebotCustomRole from "./routes/customRole";
import FirebotPresetEffectList from "./routes/presetEffectList";
import FirebotCommand from "./routes/command";
import FirebotTimer from "./routes/timer";
import { JsonValue } from "@elgato/streamdeck";

export class FirebotInstance extends ApiBase {
    private readonly _data: FirebotInstanceData;
    private _counters: FirebotCounter[];
    private _customRoles: FirebotCustomRole[];
    private _queues: FirebotQueue[];
    private _timers: FirebotTimer[];
    private _customVariables: Record<string, ApiCustomVariableBody>;
    constructor(endpoint?: string, name?: string) {
        super();
        this._data = {
            endpoint,
            name,
            status: FirebotInstanceStatus.OFFLINE
        };
        this._counters = [];
        this._customRoles = [];
        this._queues = [];
        this._timers = [];
        this._customVariables = { };
    }

    get isNull() {
        return this._data.endpoint == null;
    }

    get counters() {
        return this._counters;
    }

    get customRoles() {
        return this._customRoles;
    }

    get customVariables() {
        return this._customVariables;
    }

    get queues() {
        return this._queues;
    }

    get timers() {
        return this._timers;
    }

    get data() {
        return this._data;
    }

    private async arrayFetch<Tin, Tout>(apiPath: string, transformer: (input: Tin) => Tout): Promise<Tout[]> {
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/${apiPath}`, this.abortSignal);
        const inputs = await result.json() as Tin[];
        const outputs: Tout[] = [];
        if (!Array.isArray(inputs)) {
            return [];
        }
        for (const input of inputs) {
            outputs.push(transformer(input));
        }
        return outputs;
    }

    private async fetchCounters(): Promise<FirebotCounter[]> {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiCounter, FirebotCounter>("counters", (counter) => {
            return new FirebotCounter(counter, this._data.endpoint);
        });
    }

    private async fetchQueues(): Promise<FirebotQueue[]> {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiQueue, FirebotQueue>("queues", (queue) => {
            return new FirebotQueue(queue, this._data.endpoint);
        });
    }

    private async fetchCustomRoles(): Promise<FirebotCustomRole[]> {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiCustomRole, FirebotCustomRole>("customRoles", (role) => {
            return new FirebotCustomRole(role, this._data.endpoint);
        });
    }

    async getPresetEffectLists(): Promise<FirebotPresetEffectList[]> {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiPresetEffectList, FirebotPresetEffectList>("effects/preset", (list) => {
            return new FirebotPresetEffectList(list, this._data.endpoint);
        });
    }

    private async fetchCommandsByType(type: FirebotCommandData["type"]): Promise<FirebotCommand[]> {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiCommand, FirebotCommand>(`commands/${type}`, (command) => {
            return new FirebotCommand(command, type, this._data.endpoint);
        });
    }

    private async fetchCustomVariables() {
        if (this._data.endpoint == null) {
            return {};
        }
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/custom-variables`, this.abortSignal);
        const variables = await result.json() as Record<string, ApiCustomVariableBody>;
        if (typeof variables === "object" && variables != null) {
            return variables;
        }
        return { };
    }

    async getCommands() {
        const [
            systemCommands,
            customCommands
        ] = await Promise.all([
            this.fetchCommandsByType("system"),
            this.fetchCommandsByType("custom")
        ]);

        return [
            ...systemCommands,
            ...customCommands
        ];
    }

    private async fetchTimers() {
        if (this._data.endpoint == null) {
            return [];
        }
        return this.arrayFetch<ApiTimer, FirebotTimer>("timers", (timer) => {
            return new FirebotTimer(timer, this._data.endpoint);
        });
    }

    async updateTimers() {
        this._timers = await this.fetchTimers();
    }

    async getCustomVariable(name: string) {
        if (this._data.endpoint == null) {
            return null;
        }
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/custom-variables/${encodeURIComponent(name)}`, this.abortSignal);
        return await result.json() as Promise<JsonValue>;
    }

    async setCustomVariable(name: string, data: JsonValue, ttl = 0) {
        if (this._data.endpoint == null) {
            return false;
        }
        try {
            await fetch(`http://${this._data.endpoint}:7472/api/v1/custom-variables/${encodeURIComponent(name)}`, {
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

            this._customVariables[name] = {
                t: 0,
                v: data
            };
            return true;
        } catch (error) {
            return false;
        }
    }

    async setCustomVariableWithPath(name: string, data: JsonValue, propertyPath: string, ttl = 0) {
        if (this._data.endpoint == null) {
            return false;
        }
        try {
            const variable = await this.getCustomVariable(name);
            let cursor = variable;
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

            return this.setCustomVariable(name, variable, ttl);
        } catch (error) {
            return false;
        }
    }

    async update() {
        try {
            [
                this._counters,
                this._customVariables,
                this._queues,
                this._customRoles,
                this._timers
            ] = await Promise.all([
                this.fetchCounters(),
                this.fetchCustomVariables(),
                this.fetchQueues(),
                this.fetchCustomRoles(),
                this.fetchTimers()
            ]);
            this._data.status = FirebotInstanceStatus.ONLINE;
        } catch (err) {
            this._data.status = FirebotInstanceStatus.OFFLINE;
        }
    }
}