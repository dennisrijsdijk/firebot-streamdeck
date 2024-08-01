import ApiBase from "../apiBase";
import { FirebotCommandData } from "../../../types/firebot";
import { ApiCommand } from "../../../types/api";

export default class FirebotCommand extends ApiBase {
    private readonly _data: FirebotCommandData;
    constructor(apiCommand: ApiCommand, type: FirebotCommandData["type"], endpoint: string) {
        super(endpoint);
        this._data = {
            id: apiCommand.id,
            trigger: apiCommand.trigger,
            type
        };
    }

    get data() {
        return this._data;
    }

    setTrigger(trigger: string) {
        this._data.trigger = trigger;
    }

    async run(args: string) {
        await fetch(`${this.baseEndpoint}/commands/${this.data.type}/${this._data.id}/run`, {
            ...this.abortSignal,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                args
            })
        });
    }
}