import ApiBase from "./apiBase";
import {FirebotInstanceData, FirebotInstanceStatus} from "../../types/firebot";
import FirebotCounter from "./routes/counter";

export class FirebotInstance extends ApiBase {
    private readonly _data: FirebotInstanceData;
    private _counters: FirebotCounter[];
    constructor(endpoint: string, name: string) {
        super();
        this._data = {
            endpoint,
            name,
            status: FirebotInstanceStatus.OFFLINE
        }
        this._counters = [];
    }

    get counters() {
        return this._counters;
    }

    get data() {
        return this._data;
    }

    private async fetchCounters(): Promise<FirebotCounter[]> {
        const counters: FirebotCounter[] = [];
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/counters`, this.abortSignal);
        const resultObject = await result.json();
        if (Array.isArray(resultObject)) {
            (resultObject as any[]).forEach(counter => counters.push(new FirebotCounter(counter, this._data.endpoint)));
        }
        return counters;
    }

    async update() {
        try {
            this._counters = await this.fetchCounters();
            this._data.status = FirebotInstanceStatus.ONLINE;
        } catch (err) {
            this._data.status = FirebotInstanceStatus.OFFLINE;
        }
    }
}