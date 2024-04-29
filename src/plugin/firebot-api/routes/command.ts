import ApiBase from "../apiBase";
import { FirebotCommandData } from "../../../types/firebot";
import { ApiCommand } from "../../../types/api";

export default class FirebotCommand extends ApiBase {
    private readonly _data: FirebotCommandData;
    private readonly _endpoint: string;
    constructor(apiCommand: ApiCommand, type: FirebotCommandData["type"], endpoint: string) {
        super();
        this._data = {
            id: apiCommand.id,
            trigger: apiCommand.trigger,
            type
        };
        this._endpoint = endpoint;
    }

    get data() {
        return this._data;
    }

    async run(args: string) {
        await fetch(`http://${this._endpoint}:7472/api/v1/commands/${this.data.type}/${this._data.id}/run`, {
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