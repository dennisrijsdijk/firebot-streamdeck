import PiAction from "../piAction";
import { ActionBaseSettings, TimerSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotTimerData } from "../../types/firebot";
import * as dom from "../dom";
import settingsCache from "../settingsCache";

class PiTimer implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<TimerSettings>;
    }

    private id = document.getElementById('id') as HTMLSelectElement;
    private action = document.getElementById('action') as HTMLSelectElement;

    private async getTimers(endpoint: string): Promise<FirebotTimerData[]> {
        const timers = await streamDeck.plugin.fetch<FirebotTimerData[]>({
            path: ROUTE.TIMER,
            body: {
                endpoint: endpoint
            }
        });

        if (!timers.ok || !timers.body) {
            return [];
        }

        return timers.body;
    }

    async defaultSettings(): Promise<void> {
        const timers = await this.getTimers(settingsCache.global.defaultEndpoint);

        let timer: FirebotTimerData | null = null;

        if (timers.length > 0) {
            timer = timers[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: timer?.id ?? null,
                action: "toggle"
            }
        };

        await settingsCache.saveAction();
    }

    async populateTimers() {
        const timers = await this.getTimers(settingsCache.action.endpoint);

        this.id.innerHTML = '';

        for (const timer of timers) {
            this.id.add(dom.createOption(timer.name, timer.id, timer.id === this.settings.action.id));
        }

        if (this.id.value !== this.settings.action.id && timers.length > 0) {
            this.id.value = timers[0].id;
            this.settings.action.id = timers[0].id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            await settingsCache.saveAction();
        });

        this.action.value = (this.settings.action.action);

        this.action.addEventListener('change', async () => {
            this.settings.action.action = this.action.value as TimerSettings["action"];
            await settingsCache.saveAction();
        });

        await this.populateTimers();
    }

    async instanceUpdated() {
        await this.populateTimers();
    }
}

export default new PiTimer();
