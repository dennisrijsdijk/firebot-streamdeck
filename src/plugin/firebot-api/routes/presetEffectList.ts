import ApiBase from "../apiBase";
import { FirebotPresetEffectListData } from "../../../types/firebot";
import { ApiPresetEffectList } from "../../../types/api";
import { PresetEffectListSettings } from "../../../types/settings";

export default class FirebotPresetEffectList extends ApiBase {
    private readonly _data: FirebotPresetEffectListData;
    private readonly _endpoint: string;
    constructor(apiPresetList: ApiPresetEffectList, endpoint: string) {
        super();
        this._data = apiPresetList;
        this._endpoint = endpoint;
    }

    get data() {
        return this._data;
    }

    private async updateArgs() {
        const result = await fetch(`http://${this._endpoint}:7472/api/v1/effects/preset/`, this.abortSignal);
        const presetLists = await result.json() as ApiPresetEffectList[];
        const maybeSelf = presetLists.find(preset => preset.id === this._data.id);
        this._data.args = maybeSelf?.args ?? [];
        return this._data.args;
    }

    async run(rawArgs: PresetEffectListSettings["arguments"]) {
        const args: Record<string, string> = {};
        const allowedArgs = await this.updateArgs();
        allowedArgs.forEach((arg) => {
            if (!rawArgs[arg] || rawArgs[arg] === "") {
                return;
            }
            args[arg] = rawArgs[arg];
        });
        await fetch(`http://${this._endpoint}:7472/api/v1/effects/preset/${this._data.id}/run`, {
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