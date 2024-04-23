import ApiBase from "./apiBase";
import {FirebotInstanceData, FirebotInstanceStatus} from "../../types/firebot";
import FirebotCounter from "./routes/counter";
import FirebotQueue from "./routes/queue";
import {ApiCounter, ApiCustomRole, ApiPresetEffectList, ApiQueue} from "../../types/api";
import FirebotCustomRole from "./routes/customRole";
import FirebotPresetEffectList from "./routes/presetEffectList";

export class FirebotInstance extends ApiBase {
    private readonly _data: FirebotInstanceData;
    private _counters: FirebotCounter[];
    private _customRoles: FirebotCustomRole[];
    private _queues: FirebotQueue[];
    private _presetEffectLists: FirebotPresetEffectList[];
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
        this._presetEffectLists = [];
    }

    get counters() {
        return this._counters;
    }

    get customRoles() {
        return this._customRoles;
    }

    get queues() {
        return this._queues;
    }

    get presetEffectLists() {
        return this._presetEffectLists;
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

    private async fetchPresetEffectLists(): Promise<FirebotPresetEffectList[]> {
        return this.arrayFetch<ApiPresetEffectList, FirebotPresetEffectList>("effects/preset", list => {
            return new FirebotPresetEffectList(list, this._data.endpoint);
        });
    }

    async update() {
        try {
            [
                this._counters,
                this._queues,
                this._customRoles,
                this._presetEffectLists
            ] = await Promise.all([
                this.fetchCounters(),
                this.fetchQueues(),
                this.fetchCustomRoles(),
                this.fetchPresetEffectLists()
            ]);
            this._data.status = FirebotInstanceStatus.ONLINE;
        } catch (err) {
            this._data.status = FirebotInstanceStatus.OFFLINE;
        }
    }
}