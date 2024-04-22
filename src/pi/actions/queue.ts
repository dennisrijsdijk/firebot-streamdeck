import PiAction from "../piAction";
import {ActionBaseSettings, QueueSettings} from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import {ROUTE} from "../../constants";
import {FirebotQueueData} from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiQueue implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<QueueSettings>;
    }

    private async getQueues(endpoint: string): Promise<FirebotQueueData[]> {
        const queues = await streamDeck.plugin.fetch<FirebotQueueData[]>({
            path: ROUTE.QUEUE,
            body: {
                endpoint: endpoint,
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
                action: "toggle",
            }
        };

        await settingsCache.saveAction();
    }

    async populateQueues() {
        const queues = await this.getQueues(settingsCache.action.endpoint);

        const queueSelect = $('#queue-id-select');

        queueSelect.find('option').remove();

        for (let i = 0; i < queues.length; i++) {
            const queue = queues[i];
            queueSelect.append(new Option(
                queue.name,
                queue.id,
                i === 0,
                queue.id === this.settings.action.id
            ));
        }

        const id = queueSelect.find("option:selected").val() as string;

        if (id !== this.settings.action.id) {
            this.settings.action.id = id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        const queueSelect = $('#queue-id-select');
        const queueActionSelect = $('#queue-action-select');

        queueSelect.on('change', async () => {
            this.settings.action.id = queueSelect.find("option:selected").val() as string;
            await settingsCache.saveAction();
        });

        queueActionSelect.val(this.settings.action.action);

        queueActionSelect.on('change', async () => {
            this.settings.action.action = queueActionSelect.find("option:selected").val() as QueueSettings["action"];
            await settingsCache.saveAction();
        });

        await this.populateQueues();
    }

    async instanceUpdated() {
        await this.populateQueues();
    }
}

export default new PiQueue();
