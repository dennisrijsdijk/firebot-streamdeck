import ApiBase from "../apiBase";
import { FirebotPresetEffectListData } from "../../../types/firebot";
import { ApiPresetEffectList } from "../../../types/api";
import { PresetEffectListSettings } from "../../../types/settings";

export default class FirebotPresetEffectList extends ApiBase {
    private readonly _data: FirebotPresetEffectListData;
    constructor(apiPresetList: ApiPresetEffectList, endpoint: string) {
        super(endpoint);
        this._data = apiPresetList;
    }

    get data() {
        return this._data;
    }

    async run(rawArgs: PresetEffectListSettings["arguments"]) {
        const args: Record<string, string> = {};
        this._data.args.forEach((arg) => {
            if (!rawArgs[arg] || rawArgs[arg] === "") {
                return;
            }
            args[arg] = rawArgs[arg];
        });
        await fetch(`${this.baseEndpoint}/effects/preset/${this._data.id}/run`, {
            ...this.abortSignal,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                args: args
                // Username?
                // Metadata?
            })
        });
    }
}