import { SettingsInstance } from "../../types/settings";
import { EventEmitter } from "node:events";
import { FirebotInstance } from "./instance";

type InstanceWithTimeout = {
    instance: FirebotInstance;
    timeout?: ReturnType<typeof setTimeout>;
}

class FirebotService extends EventEmitter {
    private _instances: Record<string, InstanceWithTimeout>;

    constructor() {
        super();
        this._instances = {};
    }

    public getInstance(endpoint: string) {
        return this._instances[endpoint]?.instance ?? new FirebotInstance();
    }

    public async updateInstances(instances: SettingsInstance[]): Promise<void> {
        Object.keys(this._instances).forEach(key => clearTimeout(this._instances[key].timeout));

        this._instances = {};

        instances.map(instance => this.registerInstance(instance.endpoint, instance.name));

        await Promise.all(Object.keys(this._instances).map(key => this.updateInstance(key)));
    }

    private registerInstance(endpoint: string, label: string) {
        const instance = {
            instance: new FirebotInstance(endpoint, label),
            timeout: undefined
        };
        this._instances[endpoint] = instance;
    }

    async updateInstance(endpoint: string) {
        const instance = this._instances[endpoint];
        if (instance == null) {
            return;
        }
        clearTimeout(instance.timeout);
        await instance.instance.update();
        this.emit("data_updated", endpoint);
        instance.timeout = setTimeout(() => this.updateInstance(endpoint), 500);
    }
}

export default new FirebotService();