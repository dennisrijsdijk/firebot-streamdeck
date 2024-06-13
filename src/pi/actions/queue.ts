import PiAction from "../piAction";
import { ActionBaseSettings, QueueSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotQueueData } from "../../types/firebot";
import * as dom from "../dom";
import settingsCache from "../settingsCache";

class PiQueue implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<QueueSettings>;
    }

    private id = document.getElementById('id') as HTMLSelectElement;
    private action = document.getElementById('action') as HTMLSelectElement;

    private async getQueues(endpoint: string): Promise<FirebotQueueData[]> {
        const queues = await streamDeck.plugin.fetch<FirebotQueueData[]>({
            path: ROUTE.QUEUE,
            body: {
                endpoint: endpoint
            }
        });

        if (!queues.ok || !queues.body) {
            return [];
        }

        return queues.body;
    }

    async defaultSettings(): Promise<void> {
        const queues = await this.getQueues(settingsCache.global.defaultEndpoint);

        let queue: FirebotQueueData | null = null;

        if (queues.length > 0) {
            queue = queues[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: queue?.id ?? null,
                action: "toggle"
            }
        };

        await settingsCache.saveAction();
    }

    async populateQueues() {
        const queues = await this.getQueues(settingsCache.action.endpoint);

        this.id.innerHTML = '';

        for (const queue of queues) {
            this.id.add(dom.createOption(queue.name, queue.id, queue.id === this.settings.action.id));
        }

        if (this.id.value !== this.settings.action.id) {
            this.id.value = queues[0].id;
            this.settings.action.id = queues[0].id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            await settingsCache.saveAction();
        });

        this.action.value = this.settings.action.action;

        this.action.addEventListener('change', async () => {
            this.settings.action.action = this.action.value as QueueSettings["action"];
            await settingsCache.saveAction();
        });

        await this.populateQueues();
    }

    async instanceUpdated() {
        await this.populateQueues();
    }
}

export default new PiQueue();
