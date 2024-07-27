import ApiBase from "../apiBase";
import { FirebotTimerData } from "../../../types/firebot";
import { ApiTimer } from "../../../types/api";
import { TimerSettings } from "../../../types/settings";

export default class FirebotTimer extends ApiBase {
    private readonly _data: FirebotTimerData;
    private readonly _endpoint: string;
    constructor(apiTimer: ApiTimer, endpoint: string) {
        super(endpoint);
        this._data = apiTimer;
    }

    get data() {
        return this._data;
    }

    async update(mode: TimerSettings["action"]) {
        await fetch(`${this.baseEndpoint}/timers/${this._data.id}/${mode}`, this.abortSignal);
    }
}