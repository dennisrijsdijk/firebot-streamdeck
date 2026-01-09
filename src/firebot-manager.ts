import streamDeck from "@elgato/streamdeck";
import { CommandDefinition, Counter, FirebotClient, WebsocketCustomRole, WebsocketCustomVariable, WebsocketPresetEffectList } from "@dennisrijsdijk/node-firebot";
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
                commands: {},
                counters: {},
                customRoles: {},
                customVariables: {},
                presetEffectLists: {},
            }
        };

        const commandCreatedOrUpdated = (command: CommandDefinition) => {
            if (!command.id) {
                streamDeck.logger.error(`Received command without ID (${command.trigger}) from Firebot instance at ${settingsInstance.endpoint}`);
                return;
            }

            if (!command.type) {
                streamDeck.logger.error(`Received command without type (${command.trigger}) from Firebot instance at ${settingsInstance.endpoint}`);
                return;
            }

            instance.data.commands[command.id] = {
                id: command.id,
                trigger: command.trigger,
                type: command.type,
            };
        }

        const counterCreatedOrUpdated = (counter: Counter) => {
            instance.data.counters[counter.id] = {
                id: counter.id,
                name: counter.name,
                value: counter.value,
            };

            this.emit("variablesDataUpdated", instance);
        };

        const customRoleCreatedOrUpdated = (customRole: WebsocketCustomRole) => {
            instance.data.customRoles[customRole.id] = {
                id: customRole.id,
                name: customRole.name,
                count: customRole.viewers.length
            };

            this.emit("variablesDataUpdated", instance);
        };

        const customVariableCreatedOrUpdated = (variable: WebsocketCustomVariable) => {
            instance.data.customVariables[variable.name] = variable.value;
            this.emit("variablesDataUpdated", instance);
        };

        const presetEffectListCreatedOrUpdated = (presetEffectList: WebsocketPresetEffectList) => {
            instance.data.presetEffectLists[presetEffectList.id] = {
                id: presetEffectList.id,
                name: presetEffectList.name,
                argumentNames: presetEffectList.args.map(arg => arg.name),
            };
        };

        client.websocket.on("command:created", commandCreatedOrUpdated.bind(this));
        client.websocket.on("command:updated", commandCreatedOrUpdated.bind(this));
        client.websocket.on("command:deleted", (command) => {
            if (!command.id) {
                streamDeck.logger.error(`Received deleted command without ID (${command.trigger}) from Firebot instance at ${settingsInstance.endpoint}`);
                return;
            }
            delete instance.data.commands[command.id];
        });

        client.websocket.on("counter:created", counterCreatedOrUpdated.bind(this));
        client.websocket.on("counter:updated", counterCreatedOrUpdated.bind(this));
        client.websocket.on("counter:deleted", (counter) => {
            delete instance.data.counters[counter.id];
            this.emit("variablesDataUpdated", instance);
        });

        client.websocket.on("custom-role:created", customRoleCreatedOrUpdated.bind(this));
        client.websocket.on("custom-role:updated", customRoleCreatedOrUpdated.bind(this));
        client.websocket.on("custom-role:deleted", (customRole) => {
            delete instance.data.customRoles[customRole.id];
        });

        client.websocket.on("custom-variable:created", customVariableCreatedOrUpdated.bind(this));
        client.websocket.on("custom-variable:updated", customVariableCreatedOrUpdated.bind(this));
        client.websocket.on("custom-variable:deleted", (variable) => {
            delete instance.data.customVariables[variable.name];
            this.emit("variablesDataUpdated", instance);
        });

        client.websocket.on("preset-effect-list:created", presetEffectListCreatedOrUpdated.bind(this));
        client.websocket.on("preset-effect-list:updated", presetEffectListCreatedOrUpdated.bind(this));
        client.websocket.on("preset-effect-list:deleted", (presetEffectList) => {
            delete instance.data.presetEffectLists[presetEffectList.id];
        });

        // ...
        client.websocket.on("connected", async () => {
            streamDeck.logger.info(`Connected to Firebot instance at ${settingsInstance.endpoint}`);

            const systemCommands = await client.commands.getSystemCommands();
            const customCommands = await client.commands.getCustomCommands();
            instance.data.commands = {};
            systemCommands.forEach(command => {
                instance.data.commands[command.id] = {
                    id: command.id,
                    trigger: command.trigger,
                    type: "system",
                };
            });

            customCommands.forEach(command => {
                instance.data.commands[command.id] = {
                    id: command.id,
                    trigger: command.trigger,
                    type: "custom",
                };
            });

            const counters = await client.counters.getCounters();
            instance.data.counters = {};
            counters.forEach(counter => {
                instance.data.counters[counter.id] = {
                    id: counter.id,
                    name: counter.name,
                    value: counter.value,
                };
            });

            const customRoles = await client.customRoles.getCustomRoles();
            instance.data.customRoles = {};
            customRoles.forEach(customRole => {
                instance.data.customRoles[customRole.id] = {
                    id: customRole.id,
                    name: customRole.name,
                    count: customRole.viewers.length
                };
            });

            const customVariables = await client.customVariables.getCustomVariables();
            instance.data.customVariables = {};
            customVariables.forEach(variable => {
                instance.data.customVariables[variable.name] = variable.data;
            });

            const presetEffectLists = await client.effects.getPresetEffectLists();
            instance.data.presetEffectLists = {};
            presetEffectLists.forEach(presetEffectList => {
                instance.data.presetEffectLists[presetEffectList.id] = {
                    id: presetEffectList.id,
                    name: presetEffectList.name,
                    argumentNames: presetEffectList.args,
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