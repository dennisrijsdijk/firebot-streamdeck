import { SettingsInstance } from "../../types/settings";
import { EventEmitter } from "node:events";
import { FirebotInstance } from "./instance";

class FirebotService extends EventEmitter {
    private _instances: Record<string, FirebotInstance>;

    constructor() {
        super();
        this._instances = {};
    }

    public emitDataUpdate(endpoint: string) {
        this.emit("data_updated", endpoint);
    }

    public getInstance(endpoint: string) {
        return this._instances[endpoint] ?? new FirebotInstance();
    }

    public async updateInstances(instances: SettingsInstance[]): Promise<void> {
        const existingEndpoints = Object.keys(this._instances);

        const newInstances = instances.filter(instance => !existingEndpoints.includes(instance.endpoint));

        const newEndpoints = instances.map(instance => instance.endpoint);

        const deleteEndpoints = existingEndpoints.filter(endpoint => !newEndpoints.includes(endpoint));

        deleteEndpoints.forEach((endpoint) => {
            this._instances[endpoint].close();
            delete this._instances[endpoint];
        });

        newInstances.forEach(instance => this._instances[instance.endpoint] = new FirebotInstance(instance.endpoint, instance.name));
    }
}

export default new FirebotService();