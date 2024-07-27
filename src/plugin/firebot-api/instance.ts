import { FirebotInstanceData, FirebotInstanceStatus } from "../../types/firebot";
import FirebotCounter from "./routes/counter";
import FirebotQueue from "./routes/queue";
import FirebotCustomRole from "./routes/customRole";
import FirebotPresetEffectList from "./routes/presetEffectList";
import FirebotCommand from "./routes/command";
import FirebotTimer from "./routes/timer";
import { JsonValue } from "@elgato/streamdeck";

import { ApiClient } from "./apiClient";
import { FirebotWebSocket } from "./websocket";
import service from "./service";
import { ApiCounter, ApiCustomRole, ApiQueue, ApiTimer } from "../../types/api";

export class FirebotInstance {
    private _ws: FirebotWebSocket;
    private _updateTimeout: ReturnType<typeof setTimeout>;
    private _consistentUpdateInterval: ReturnType<typeof setInterval>;
    private _apiClient: ApiClient;
    private readonly _data: FirebotInstanceData;
    private _commands: Record<string, FirebotCommand>;
    private _counters: Record<string, FirebotCounter>;
    private _customRoles: Record<string, FirebotCustomRole>;
    private _queues: Record<string, FirebotQueue>;
    private _presetLists: Record<string, FirebotPresetEffectList>;
    private _timers: Record<string, FirebotTimer>;
    private _customVariables: Record<string, JsonValue>;

    constructor(endpoint?: string, name?: string) {
        this._apiClient = new ApiClient(endpoint);
        this._ws = new FirebotWebSocket(endpoint);
        this._data = {
            endpoint,
            name,
            status: FirebotInstanceStatus.OFFLINE
        };
        this._commands = {};
        this._counters = {};
        this._customRoles = {};
        this._queues = {};
        this._presetLists = {};
        this._timers = {};
        this._customVariables = {};

        this.startRendering();

        this.hookWebSocket();
    }

    private sendUpdate() {
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(() => service.emitDataUpdate(this._data.endpoint), 10);
    }

    private startRendering() {
        clearInterval(this._consistentUpdateInterval);
        this._consistentUpdateInterval = setInterval(() => this.sendUpdate(), 250);
    }

    private async connectionPoll() {
        if (await this._apiClient.isOnline()) {
            this._ws.start();
            return;
        }
        setTimeout(() => this.connectionPoll(), 5e3);
    }

    private hookWebSocket() {
        this._ws.on("close", (code: number) => {
            if (code >= 4100) {
                return;
            }

            this.connectionPoll();
        });

        this._ws.on("registration-success", async () => {
            await this.update();
            this.sendUpdate();
        });

        this._ws.on("effect-queue:length-updated", ({ id, length }: {id: string, length: number}) => {
            this._queues[id]?.updateLength(length);
        });

        this._ws.on("firebot-event", (event) => {
            const { action, subject, data }: {
                action: "create" | "update" | "delete" | null,
                subject: string,
                data: unknown;
            } = event;

            const key = subject === "_customVariables" ? "name" : "id";
            let value = null;

            if (action === "delete") {
                delete this[subject][data[key]];
                this.sendUpdate();
                return;
            }

            switch (subject) {
                case "_commands": {
                    const { id, trigger, type } = data as {
                        id: string,
                        trigger: string,
                        type: "custom" | "system"
                    };
                    value = new FirebotCommand({ id, trigger }, type, this.data.endpoint);
                    break;
                }
                case "_counters": {
                    value = new FirebotCounter(data as ApiCounter, this.data.endpoint);
                    break;
                }
                case "_customRoles": {
                    value = new FirebotCustomRole(data as ApiCustomRole, this.data.endpoint);
                    break;
                }
                case "_customVariables": {
                    value = (data as { value: JsonValue }).value as JsonValue;
                    break;
                }
                case "_queues": {
                    value = new FirebotQueue(data as ApiQueue, this.data.endpoint);
                    break;
                }
                case "_presetLists": {
                    const { id, name, args } = data as {
                        id: string;
                        name: string;
                        args: {name: string}[]
                    }
                    value = new FirebotPresetEffectList({ id, name, args: args.map(arg => arg.name) }, this.data.endpoint);
                    break;
                }
                case "_timers": {
                    value = new FirebotTimer(data as ApiTimer, this.data.endpoint);
                    break;
                }
            }

            this[subject][data[key]] = value;
            this.sendUpdate();
            return;
        });

        this.connectionPoll();
    }

    get isNull() {
        return this._data.endpoint == null;
    }

    get commands() {
        return this._commands;
    }

    get counters() {
        return this._counters;
    }

    get customRoles() {
        return this._customRoles;
    }

    get customVariables() {
        return this._customVariables;
    }

    async setCustomVariable(name: string, data: JsonValue, ttl = 0) {
        return this._apiClient.setCustomVariable(name, data, ttl);
    }

    async setCustomVariableWithPath(name: string, data: JsonValue, propertyPath: string, ttl = 0) {
        return this._apiClient.setCustomVariableWithPath(name, data, this._customVariables[name], propertyPath, ttl);
    }

    get queues() {
        return this._queues;
    }

    get presetLists() {
        return this._presetLists;
    }

    get timers() {
        return this._timers;
    }

    get data() {
        return this._data;
    }

    close() {
        this._ws.close();
    }

    async update() {
        try {
            [
                this._commands,
                this._counters,
                this._customRoles,
                this._queues,
                this._presetLists,
                this._timers,
                this._customVariables
            ] = await Promise.all([
                this._apiClient.getCommands(),
                this._apiClient.getCounters(),
                this._apiClient.getCustomRoles(),
                this._apiClient.getEffectQueues(),
                this._apiClient.getPresetEffectLists(),
                this._apiClient.getTimers(),
                this._apiClient.getCustomVariables()
            ]);
        } catch (err) {
            this._commands = {};
            this._counters = {};
            this._customRoles = {};
            this._queues = {};
            this._presetLists = {};
            this._timers = {};
            this._customVariables = {};
        }
    }
}