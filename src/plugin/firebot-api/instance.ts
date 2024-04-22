import ApiBase from "./apiBase";
import {FirebotInstanceData, FirebotInstanceStatus} from "../../types/firebot";
import FirebotCounter from "./routes/counter";
import FirebotQueue from "./routes/queue";
import {ApiCounter, ApiQueue} from "../../types/api";

export class FirebotInstance extends ApiBase {
    private readonly _data: FirebotInstanceData;
    private _counters: FirebotCounter[];
    private _queues: FirebotQueue[];
    constructor(endpoint: string, name: string) {
        super();
        this._data = {
            endpoint,
            name,
            status: FirebotInstanceStatus.OFFLINE
        }
        this._counters = [];
        this._queues = [];
    }

    get counters() {
        return this._counters;
    }

    get queues() {
        return this._queues;
    }

    get data() {
        return this._data;
    }

    private async fetchCounters(): Promise<FirebotCounter[]> {
        const counters: FirebotCounter[] = [];
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/counters`, this.abortSignal);
        const resultObject = await result.json();
        if (Array.isArray(resultObject)) {
            (resultObject as any[]).forEach((counter: ApiCounter) => counters.push(new FirebotCounter(counter, this._data.endpoint)));
        }
        return counters;
    }

    private async fetchQueues(): Promise<FirebotQueue[]> {
        const queues: FirebotQueue[] = [];
        const result = await fetch(`http://${this._data.endpoint}:7472/api/v1/queues`, this.abortSignal);
        const resultObject = await result.json();
        if (Array.isArray(resultObject)) {
            (resultObject as any[]).forEach((queue: ApiQueue) => queues.push(new FirebotQueue(queue, this._data.endpoint)));
        }
        return queues;
    }

    async update() {
        try {
            [
                this._counters,
                this._queues
            ] = await Promise.all([
                this.fetchCounters(),
                this.fetchQueues()
            ]);
            this._data.status = FirebotInstanceStatus.ONLINE;
        } catch (err) {
            this._data.status = FirebotInstanceStatus.OFFLINE;
        }
    }
}