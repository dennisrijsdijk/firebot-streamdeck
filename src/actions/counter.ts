import streamDeck, { action, KeyDownEvent, SendToPluginEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

@action({ UUID: "gg.dennis.firebot.counter" })
export class CounterAction extends BaseAction<CounterActionSettings> {
	async sendCounters(settings: BaseActionSettings<CounterActionSettings>) {
		await this.waitUntilReady();

		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}

		if (!instance.connected) {
			streamDeck.logger.error(`Not connected to Firebot instance at endpoint: ${settings.endpoint}, refusing to serve stale data.`);
			return;
		}

		const dataSourcePayload: DataSourcePayload = {
			event: "getCounters",
			items: Object.values(instance.data.counters || {}).map(counter => ({
				label: counter.name,
				value: counter.id,
			}))
		}

		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async instanceChanged(actionId: string, settings: BaseActionSettings<CounterActionSettings>): Promise<void> {
		return this.sendCounters(settings);
	}

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CounterActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCounters") {
			return;
		}

		const settings = await ev.action.getSettings();
		return this.sendCounters(settings);
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CounterActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return ev.action.showAlert();
		}
		
		const counterId = ev.payload.settings.action?.id;
		const value = ev.payload.settings.action?.value || 1;
		const overrideValue = ev.payload.settings.action?.action === "set";
		if (!counterId) {
			streamDeck.logger.error(`No counter ID set for action ${ev.action.id}`);
			return ev.action.showAlert();
		}
		instance.client.counters.updateCounter(counterId, value, overrideValue).catch((err) => {
			streamDeck.logger.error(`Failed to update counter: ${err.message}`);
			ev.action.showAlert();
		});
	}
}