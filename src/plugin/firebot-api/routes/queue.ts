import ApiBase from "../apiBase";
import { FirebotQueueData } from "../../../types/firebot";
import { QueueSettings } from "../../../types/settings";
import { ApiQueue, ApiQueueUpdateResponse } from "../../../types/api";

export default class FirebotQueue extends ApiBase {
    private readonly _data: FirebotQueueData;
    private _length: number;
    private _active: boolean;
    constructor(apiQueue: ApiQueue, endpoint: string) {
        super(endpoint);
        this._data = { id: apiQueue.id, name: apiQueue.name };
        this._active = apiQueue.active;
        this._length = apiQueue.length;
    }

    get data() {
        return this._data;
    }

    get active() {
        return this._active;
    }

    get length() {
        return this._length;
    }

    updateLength(newLength: number) {
        this._length = newLength;
    }

    async update(mode: QueueSettings["action"]) {
        const result = await fetch(
            `${this.baseEndpoint}/queues/${this._data.id}/${mode}`,
            this.abortSignal
        );

        const resultObject = await result.json() as ApiQueueUpdateResponse;

        this._active = resultObject.active;
        this._length = resultObject.queue.length;
    }
}