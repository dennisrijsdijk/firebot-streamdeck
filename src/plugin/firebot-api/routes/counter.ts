import ApiBase from "../apiBase";
import { FirebotCounterData } from "../../../types/firebot";
import { ApiCounter } from "../../../types/api";

export default class FirebotCounter extends ApiBase {
    private readonly _data: FirebotCounterData;
    private _value: number;
    constructor(apiCounter: ApiCounter, endpoint: string) {
        super(endpoint);
        this._data = { id: apiCounter.id, name: apiCounter.name };
        this._value = apiCounter.value;
    }

    get data() {
        return this._data;
    }

    get value() {
        return this._value;
    }

    setName(name: string) {
        this._data.name = name;
    }

    setValue(value: number) {
        this._value = value;
    }

    async updateByMode(value: number, override: boolean): Promise<number> {
        const result = await fetch(`${this.baseEndpoint}/counters/${this._data.id}`, {
            ...this.abortSignal,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                value,
                override
            })
        });
        const resultObject = await result.json() as { oldValue: number, newValue: number };
        this._value = resultObject.newValue;
        return this._value;
    }

    async set(value: number): Promise<number> {
        return this.updateByMode(value, true);
    }

    async update(value: number): Promise<number> {
        return this.updateByMode(value, false);
    }
}