import ApiBase from "../apiBase";
import { FirebotQueueData } from "../../../types/firebot";
import { QueueSettings } from "../../../types/settings";
import { ApiQueue, ApiQueueUpdateResponse } from "../../../types/api";

export default class FirebotQueue extends ApiBase {
    private readonly _data: FirebotQueueData;
    private _length: number;
    private _active: boolean;
    private readonly _endpoint: string;
    constructor(apiQueue: ApiQueue, endpoint: string) {
        super();
        this._data = { id: apiQueue.id, name: apiQueue.name };
        this._active = apiQueue.active;
        this._length = apiQueue.length;
        this._endpoint = endpoint;
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

    async update(mode: QueueSettings["action"]) {
        const result = await fetch(
            `http://${this._endpoint}:7472/api/v1/queues/${this._data.id}/${mode}`,
            this.abortSignal
        );

        const resultObject = await result.json() as ApiQueueUpdateResponse;

        this._active = resultObject.active;
        this._length = resultObject.queue.length;
    }
}