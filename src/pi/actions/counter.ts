import PiAction from "../piAction";
import {ActionBaseSettings, CounterSettings} from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import {ROUTE} from "../../constants";
import {FirebotCounterData} from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiCounter implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CounterSettings>;
    }

    private async getCounters(endpoint: string): Promise<FirebotCounterData[]> {
        const counters = await streamDeck.plugin.fetch<FirebotCounterData[]>({
            path: ROUTE.COUNTER,
            body: {
                endpoint: endpoint,
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
                action: "update",
            }
        };

        await settingsCache.saveAction();
    }

    async populateCounters() {
        const counters = await this.getCounters(settingsCache.action.endpoint);

        const counterSelect = $('#counter-id-select');

        counterSelect.find('option').remove();

        for (let i = 0; i < counters.length; i++) {
            const counter = counters[i];
            counterSelect.append(new Option(
                counter.name,
                counter.id,
                i === 0,
                counter.id === this.settings.action.id
            ));
        }
    }

    async populateElements(): Promise<void> {
        const counterSet = $('#counter-set');
        const counterUpdate = $('#counter-update');
        const counterValue = $('#counter-value');

        counterValue.val(this.settings.action.value);
        if (this.settings.action.action === "set") {
            counterSet.attr('checked', 'checked');
        } else {
            counterUpdate.attr('checked', 'checked');
        }
        await this.populateCounters();
    }

    async instanceUpdated() {
        await this.populateCounters();
    }
}

export default new PiCounter();
