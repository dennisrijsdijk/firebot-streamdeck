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

        const meta = {
            event: message.name,
            data: message.data
        };

        this.emit("firebot-event", meta);
    }

    close(code = 4100) {
        this._ws.close(code);
        this._ws = null;
    }
}