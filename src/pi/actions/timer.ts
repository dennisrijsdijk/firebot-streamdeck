import PiAction from "../piAction";
import {ActionBaseSettings, TimerSettings} from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import {ROUTE} from "../../constants";
import {FirebotTimerData} from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiTimer implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<TimerSettings>;
    }

    private async getTimers(endpoint: string): Promise<FirebotTimerData[]> {
        const timers = await streamDeck.plugin.fetch<FirebotTimerData[]>({
            path: ROUTE.TIMER,
            body: {
                endpoint: endpoint,
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
                action: "toggle",
            }
        };

        await settingsCache.saveAction();
    }

    async populateTimers() {
        const timers = await this.getTimers(settingsCache.action.endpoint);

        const timerSelect = $('#timer-id-select');

        timerSelect.find('option').remove();

        for (let i = 0; i < timers.length; i++) {
            const timer = timers[i];
            timerSelect.append(new Option(
                timer.name,
                timer.id,
                i === 0,
                timer.id === this.settings.action.id
            ));
        }

        const id = timerSelect.find("option:selected").val() as string;

        if (id !== this.settings.action.id) {
            this.settings.action.id = id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        const timerSelect = $('#timer-id-select');
        const timerActionSelect = $('#timer-action-select');

        timerSelect.on('change', async () => {
            this.settings.action.id = timerSelect.find("option:selected").val() as string;
            await settingsCache.saveAction();
        });

        timerActionSelect.val(this.settings.action.action);

        timerActionSelect.on('change', async () => {
            this.settings.action.action = timerActionSelect.find("option:selected").val() as TimerSettings["action"];
            await settingsCache.saveAction();
        });

        await this.populateTimers();
    }

    async instanceUpdated() {
        await this.populateTimers();
    }
}

export default new PiTimer();
