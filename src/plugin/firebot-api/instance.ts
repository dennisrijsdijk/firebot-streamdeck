import ApiBase from "./apiBase";
import {FirebotCommandData, FirebotInstanceData, FirebotInstanceStatus} from "../../types/firebot";
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
import {JsonValue} from "@elgato/streamdeck";

export class FirebotInstance extends ApiBase {
    private readonly _data: FirebotInstanceData;
    private _counters: FirebotCounter[];
    private _customRoles: FirebotCustomRole[];
    private _queues: FirebotQueue[];
    private _timers: FirebotTimer[];
    private _customVariables: Record<string, ApiCustomVariableBody>;
    constructor(endpoint: string, name: string) {
        super();
        this._data = {
            endpoint,
            name,
            status: FirebotInstanceStatus.OFFLINE
        }
        this._counters = [];
        this._customRoles = [];
        this._queues = [];
        this._timers = [];
        this._customVariables = { };
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
        for (let input of inputs) {
            outputs.push(transformer(input));
        }
        return outputs;
    }

    private async fetchCounters(): Promise<FirebotCounter[]> {
        return this.arrayFetch<ApiCounter, FirebotCounter>("counters", counter => {
            return new FirebotCounter(counter, this._data.endpoint);
        });
    }

    private async fetchQueues(): Promise<FirebotQueue[]> {
        return this.arrayFetch<ApiQueue, FirebotQueue>("queues", queue => {
            return new FirebotQueue(queue, this._data.endpoint);
        });
    }

    private async fetchCustomRoles(): Promise<FirebotCustomRole[]> {
        return this.arrayFetch<ApiCustomRole, FirebotCustomRole>("customRoles", role => {
            return new FirebotCustomRole(role, this._data.endpoint);
        });
    }

    async getPresetEffectLists(): Promise<FirebotPresetEffectList[]> {
        return this.arrayFetch<ApiPresetEffectList, FirebotPresetEffectList>("effects/preset", list => {
            return new FirebotPresetEffectList(list, this._data.endpoint);
        });
    }

    private async fetchCommandsByType(type: FirebotCommandData["type"]): Promise<FirebotCommand[]> {
        return this.arrayFetch<ApiCommand, FirebotCommand>(`commands/${type}`, command => {
            return new FirebotCommand(command, type, this._data.endpoint);
        });
    }

    private async fetchCustomVariables() {
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
        ]
    }

    private async fetchTimers() {
        return this.arrayFetch<ApiTimer, FirebotTimer>("timers", timer => {
            return new FirebotTimer(timer, this._data.endpoint);
        });
    }

    async updateTimers() {
        this._timers = await this.fetchTimers();
    }

    async setCustomVariable(name: string, data: JsonValue, ttl: number = 0) {
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