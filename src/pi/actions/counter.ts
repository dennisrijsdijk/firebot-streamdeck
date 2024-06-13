import PiAction from "../piAction";
import { ActionBaseSettings, CounterSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotCounterData } from "../../types/firebot";
import * as dom from '../dom';
import settingsCache from "../settingsCache";

class PiCounter implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CounterSettings>;
    }

    private get mode() {
        return document.querySelector<HTMLInputElement>("input[name='mode']:checked").value;
    }

    private set = document.getElementById('set') as HTMLInputElement;
    private update = document.getElementById('update') as HTMLInputElement;
    private value = document.getElementById('value') as HTMLInputElement;
    private id = document.getElementById('id') as HTMLSelectElement;

    private async getCounters(endpoint: string): Promise<FirebotCounterData[]> {
        const counters = await streamDeck.plugin.fetch<FirebotCounterData[]>({
            path: ROUTE.COUNTER,
            body: {
                endpoint: endpoint
            }
        });

        if (!counters.ok || !counters.body) {
            return [];
        }

        return counters.body;
    }

    async defaultSettings(): Promise<void> {
        const counters = await this.getCounters(settingsCache.global.defaultEndpoint);

        let counter: FirebotCounterData | null = null;

        if (counters.length > 0) {
            counter = counters[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: counter?.id ?? null,
                value: 0,
                action: "update"
            }
        };

        await settingsCache.saveAction();
    }

    async populateCounters() {
        const counters = await this.getCounters(settingsCache.action.endpoint);

        this.id.innerHTML = '';

        for (const counter of counters) {
            this.id.add(dom.createOption(counter.name, counter.id, counter.id === this.settings.action.id));
        }

        if (this.id.value !== this.settings.action.id) {
            this.id.value = counters[0].id;
            this.settings.action.id = counters[0].id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        this.value.value = this.settings.action.value.toString();
        if (this.settings.action.action === "set") {
            this.set.setAttribute('checked', '');
            this.update.removeAttribute('checked');
        } else {
            this.update.setAttribute('checked', '');
            this.set.removeAttribute('checked');
        }

        this.value.addEventListener('input', async () => {
            const value = this.value.value;
            if (isNaN(parseInt(value, 10))) {
                return;
            }

            this.settings.action.value = parseInt(value);
            await settingsCache.saveAction();
        });

        [this.set, this.update].forEach((radio) => {
            radio.addEventListener('change', async () => {
                this.settings.action.action = this.mode as "update" | "set";
                await settingsCache.saveAction();
            })
        })

        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            await settingsCache.saveAction();
        });

        await this.populateCounters();
    }

    async instanceUpdated() {
        await this.populateCounters();
    }
}

export default new PiCounter();
