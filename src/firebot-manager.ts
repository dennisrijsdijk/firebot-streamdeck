import streamDeck from "@elgato/streamdeck";
import { FirebotClient } from "@dennisrijsdijk/node-firebot";
import { FirebotInstance } from "./types/firebot";
import EventEmitter from "events";

type FirebotManagerEvents = {
    variablesDataUpdated: FirebotInstance;
}

class FirebotManager {
    private _instances: Record<string, FirebotInstance>;
    private _eventEmitter: EventEmitter;
    private _defaultEndpoint: string = "localhost";
    private _ready = false;

    constructor() {
        this._instances = {};
        this._eventEmitter = new EventEmitter();

        streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>(async (settings) => {
            if (settings.settings.defaultEndpoint) {
                this._defaultEndpoint = settings.settings.defaultEndpoint;
            }

            // TODO: Handle added/removed instances.
        });
    }

    get defaultEndpoint(): string {
        return this._defaultEndpoint;
    }

    get ready(): boolean {
        return this._ready;
    }

    set ready(value: boolean) {
        this._ready = value;
    }

    public getInstance(endpoint: string): FirebotInstance {
        if (!this._instances[endpoint]) {
            throw new Error(`No Firebot instance found for endpoint: ${endpoint}`);
        }
        return this._instances[endpoint];
    }

    public async createInstance(settingsInstance: SettingsInstance): Promise<FirebotInstance> {
        if (this._instances[settingsInstance.endpoint]) {
            throw new Error(`Firebot instance already exists for endpoint: ${settingsInstance.endpoint}`);
        }

        const client = new FirebotClient(settingsInstance.endpoint);
        const instance: FirebotInstance = {
            client,
            endpoint: settingsInstance.endpoint,
            name: settingsInstance.name,
            data: {
                counters: {},
            }
        };

        const counterCreatedOrUpdated = (counter: FirebotInstance["data"]["counters"][string]) => {
            instance.data.counters[counter.id] = {
                id: counter.id,
                name: counter.name,
                value: counter.value,
            };

            this.emit("variablesDataUpdated", instance);
        }

        client.websocket.on("counter:created", counterCreatedOrUpdated.bind(this));
        client.websocket.on("counter:updated", counterCreatedOrUpdated.bind(this));
        client.websocket.on("counter:deleted", (counter) => {
            delete instance.data.counters[counter.id];
            this.emit("variablesDataUpdated", instance);
        });

        // ...
        client.websocket.on("connected", async () => {
            streamDeck.logger.info(`Connected to Firebot instance at ${settingsInstance.endpoint}`);
            const counters = await client.counters.getCounters();
            instance.data.counters = {};
            counters.forEach(counter => {
                instance.data.counters[counter.id] = {
                    id: counter.id,
                    name: counter.name,
                    value: counter.value,
                };
            });
            // ...
            this.emit("variablesDataUpdated", instance);
        });
        client.websocket.on("disconnected", async ({ code, reason }) => {
            if (code === 4001) {
                return;
            }

            streamDeck.logger.warn(`Disconnected from Firebot instance at ${settingsInstance.endpoint} (code: ${code}, reason: ${reason || "no reason provided"})`);

            await new Promise(resolve => setTimeout(resolve, 5000));

            try {
                client.websocket.connect();
            } catch (err) {
                streamDeck.logger.error(`Error connecting to Firebot instance at ${settingsInstance.endpoint}: ${err}`);
            }
        });

        client.websocket.on("error", async (err) => {
            streamDeck.logger.error(`WebSocket error for Firebot instance at ${settingsInstance.endpoint}: ${err}`);
        });

        try {
            client.websocket.connect();
        } catch (err) {
            streamDeck.logger.error(`Error connecting to Firebot instance at ${settingsInstance.endpoint}: ${err}`);
        }

        this._instances[settingsInstance.endpoint] = instance;
        return instance;
    }

    on<TKey extends keyof FirebotManagerEvents>(event: TKey, listener: (data: FirebotManagerEvents[TKey]) => void): void {
        this._eventEmitter.on(event as string, listener);
    }

    off<TKey extends keyof FirebotManagerEvents>(event: TKey, listener: (data: FirebotManagerEvents[TKey]) => void): void {
        this._eventEmitter.off(event as string, listener);
    }

    private emit<TKey extends keyof FirebotManagerEvents>(event: TKey, data: FirebotManagerEvents[TKey]): void {
        this._eventEmitter.emit(event as string, data);
    }
}

export default new FirebotManager();