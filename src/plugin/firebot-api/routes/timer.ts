import ApiBase from "../apiBase";
import { FirebotTimerData } from "../../../types/firebot";
import { ApiTimer } from "../../../types/api";
import { TimerSettings } from "../../../types/settings";
import firebotService from "../service";

export default class FirebotTimer extends ApiBase {
    private readonly _data: FirebotTimerData;
    private readonly _endpoint: string;
    constructor(apiTimer: ApiTimer, endpoint: string) {
        super();
        this._data = apiTimer;
        this._endpoint = endpoint;
    }

    get data() {
        return this._data;
    }

    async update(mode: TimerSettings["action"]) {
        await fetch(`http://${this._endpoint}:7472/api/v1/timers/${this._data.id}/${mode}`, this.abortSignal);
        const instance = firebotService.getInstance(this._endpoint);
        if (instance != null) {
            await instance.updateTimers();
        }
    }
}