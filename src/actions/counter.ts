import streamDeck, { action, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.counter" })
export class CounterAction extends BaseAction<CounterActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CounterActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCounters") {
			return;
		}

		const settings = await ev.action.getSettings();

		await this.waitUntilReady();

		const instance = firebotManager.getInstance(settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
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

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<CounterActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		await this.populateSettings(ev, {
			id: "",
			value: 1,
			action: "update",
		});
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CounterActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return;
		}
		const counterId = ev.payload.settings.action?.id;
		const value = ev.payload.settings.action?.value || 1;
		const overrideValue = ev.payload.settings.action?.action === "set";
		if (!counterId) {
			streamDeck.logger.error(`No counter ID set for action ${ev.action.id}`);
			return;
		}
		instance.client.counters.updateCounter(counterId, value, overrideValue).catch((err) => {
			streamDeck.logger.error(`Failed to update counter: ${err.message}`);
			ev.action.showAlert();
		});
	}
}