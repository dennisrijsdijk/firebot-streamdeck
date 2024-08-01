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
import { WebSocketEventType } from "../../types/firebot-websocket";

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

        this._ws.on("firebot-event", (firebotEvent: { event: WebSocketEventType, data: unknown }) => {
            const event = firebotEvent.event;
            const data = firebotEvent.data as {
                id: string;
                name: string;
                type: "custom" | "system";
                trigger: string;
                value: number;
                viewers: object[];
                args: Array<{name: string}>;
                length: number;
                active: boolean;
                data: { value: JsonValue };
            };
            switch (event) {
                case "command:created": {
                    const { id, trigger, type } = data;
                    this._commands[id] = new FirebotCommand({ id, trigger }, type, this.data.endpoint);
                    break;
                }

                case "counter:created": {
                    this._counters[data.id] = new FirebotCounter(data, this.data.endpoint)
                    break;
                }

                case "custom-role:created": {
                    this._customRoles[data.id] = new FirebotCustomRole(data, this.data.endpoint);
                    break;
                }

                case "custom-variable:created": {
                    this._customVariables[data.name] = data.value;
                    break;
                }

                case "effect-queue:created": {
                    this._queues[data.id] = new FirebotQueue(data, this.data.endpoint);
                    break;
                }

                case "preset-effect-list:created": {
                    const { id, name, args } = data;
                    this._presetLists[id] = new FirebotPresetEffectList({ id, name, args: args.map(arg => arg.name) }, this.data.endpoint);
                    break;
                }

                case "timer:created": {
                    this._timers[data.id] = new FirebotTimer(data, this.data.endpoint);
                    break;
                }

                case "command:updated": {
                    this._commands[data.id].setTrigger(data.trigger);
                    break;
                }

                case "counter:updated": {
                    this._counters[data.id].setName(data.name);
                    this._counters[data.id].setValue(data.value);
                    break;
                }

                case "custom-role:updated": {
                    this._customRoles[data.id].setName(data.name);
                    this._customRoles[data.id].setLength(data.viewers.length);
                    break;
                }

                case "custom-variable:updated": {
                    this._customVariables[data.name] = data.value;
                    break;
                }

                case "effect-queue:updated": {
                    this._queues[data.id].setName(data.name);
                    this._queues[data.id].setActive(data.active);
                    break;
                }

                case "effect-queue:length-updated": {
                    this._queues[data.id].setLength(data.length);
                    break;
                }

                case "preset-effect-list:updated": {
                    this._presetLists[data.id].setName(data.name);
                    this._presetLists[data.id].setArgs(data.args.map(arg => arg.name));
                    break;
                }

                case "timer:updated": {
                    this._timers[data.id].setName(data.name);
                    this._timers[data.id].setActive(data.active);
                    break;
                }

                case "counter:deleted": {
                    delete this._counters[data.id];
                    break;
                }
                case "command:deleted": {
                    delete this._commands[data.id];
                    break;
                }
                case "custom-role:deleted": {
                    delete this._customRoles[data.id];
                    break;
                }
                case "custom-variable:deleted": {
                    delete this._customVariables[data.name];
                    break;
                }
                case "effect-queue:deleted": {
                    delete this._queues[data.id];
                    break;
                }
                case "preset-effect-list:deleted": {
                    delete this._presetLists[data.id];
                    break;
                }
                case "timer:deleted": {
                    delete this._timers[data.id];
                    break;
                }

                default: {
                    break;
                }
            }
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