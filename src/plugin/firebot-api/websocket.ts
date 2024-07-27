import EventEmitter from "events";
import { WebSocket } from "ws";

import {
    Message,
    InvokeMessage
} from "../../types/firebot-websocket";

export class FirebotWebSocket extends EventEmitter {
    private _endpoint: string;
    private _ws: WebSocket;

    constructor(endpoint: string) {
        super();
        this._endpoint = endpoint;
    }

    start() {
        if (this._endpoint == null) {
            return;
        }

        if (this._ws != null) {
            this._ws.close(4101);
        }
        this._ws = new WebSocket(`ws://${this._endpoint}:7472`)
            .on("close", code => this.emit("close", code))
            .on("open", () => {
                const registration: InvokeMessage = {
                    type: "invoke",
                    name: "subscribe-events",
                    id: 0,
                    data: []
                }

                this._ws.send(JSON.stringify(registration));
            })
            .on("message", data => this.processMessage(JSON.parse(data.toString())));
    }

    processMessage(message: Message) {
        if (message.type === "response" && message.id === 0) {
            this.emit(`registration-${message.name}`); // registration-success or registration-error
            return;
        }

        if (message.type !== "event") {
            return;
        }

        if (message.name === "effect-queue:length-updated") {
            this.emit(message.name, message.data);
            return;
        }

        const meta = {
            action: null,
            subject: null,
            data: message.data
        };

        const endsWith = {
            ":created": "create",
            ":updated": "update",
            ":deleted": "delete"
        };

        for (const [key, value] of Object.entries(endsWith)) {
            if (message.name.endsWith(key)) {
                meta.action = value;
                break;
            }
        }

        const startsWith = {
            "command:custom": "_commands",
            "command:system": "_commands",
            "counter": "_counters",
            "custom-role": "_customRoles",
            "custom-variable": "_customVariables",
            "effect-queue": "_queues",
            "preset-effect-list": "_presetLists",
            "timer": "_timers"
        }

        for (const [key, value] of Object.entries(startsWith)) {
            if (message.name.startsWith(key)) {
                meta.subject = value;
                break;
            }
        }

        this.emit("firebot-event", meta);
    }

    close(code = 4100) {
        this._ws.close(code);
        this._ws = null;
    }
}