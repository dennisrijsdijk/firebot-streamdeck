import ApiBase from "../apiBase";
import { FirebotCustomRoleData } from "../../../types/firebot";
import { ApiCustomRole } from "../../../types/api";

export default class FirebotCustomRole extends ApiBase {
    private readonly _data: FirebotCustomRoleData;
    private _length: number;
    constructor(apiRole: ApiCustomRole, endpoint: string) {
        super(endpoint);
        this._data = { id: apiRole.id, name: apiRole.name };
        this._length = apiRole.viewers.length;
    }

    get data() {
        return this._data;
    }

    get length() {
        return this._length;
    }

    // This is a hack as Firebot doesn't directly expose an API function to clear roles.
    // https://github.com/crowbartools/Firebot/issues/2483
    async clear() {
        await fetch(`${this.baseEndpoint}/effects`, {
            ...this.abortSignal,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                effects: {
                    queue: null,
                    list: [
                        {
                            type: "firebot:update-roles",
                            viewerType: "current",
                            removeAllRoleId: this._data.id
                        }
                    ]
                },
                triggerData: {

                }
            })
        });
    }
}