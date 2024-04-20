import { SettingsInstance } from "../../types/settings";
import { EventEmitter } from "node:events";
import { FirebotInstance } from "./instance";

class FirebotService extends EventEmitter {
    private _instances: FirebotInstance[];
    private _timeout: ReturnType<typeof setTimeout>;

    constructor() {
        super();
        this._instances = [];
        this._timeout = setTimeout(() => {});
    }

    get instances() {
        return this._instances;
    }

    public async updateInstances(instances: SettingsInstance[]): Promise<void> {
        clearTimeout(this._timeout)
        this._instances = [];

        instances.map(instance => this.registerInstance(instance.endpoint, instance.name));

        await this.update();
    }

    private registerInstance(endpoint: string, label: string) {
        const instance = new FirebotInstance(endpoint, label);
        this._instances.push(instance);
    }

    async update() {
        await Promise.all(this.instances.map(instance => instance.update()));
        this.emit("data_updated");
        this._timeout = setTimeout(() => this.update(), 500);
    }
}

export default new FirebotService();