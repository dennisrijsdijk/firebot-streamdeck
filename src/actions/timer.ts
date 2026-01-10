import streamDeck, { Action, action, DidReceiveSettingsEvent, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.timer" })
export class TimerAction extends BaseAction<TimerActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<TimerActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getTimers") {
			return;
		}

		const settings = await ev.action.getSettings();

		await this.waitUntilReady();

		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch (error) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}

		if (!instance.connected) {
			streamDeck.logger.error(`Not connected to Firebot instance at endpoint: ${settings.endpoint}, refusing to serve stale data.`);
			return;
		}

		const dataSourcePayload: DataSourcePayload = {
			event: ev.payload.event as string,
			items: Object.values(instance.data.timers || {}).map(timer => ({
				label: timer.name,
				value: timer.id,
			}))
		}
		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<TimerActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		await this.populateSettings(ev, {
			id: ""
		});
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<TimerActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return;
		}
		const queueId = ev.payload.settings.action?.id || "";
		const timerAction = ev.payload.settings.action?.action;

		if (timerAction == null) {
			streamDeck.logger.warn(`No timer action set for action ${ev.action.id}`);
			ev.action.showAlert();
			return;
		}

		const timer = instance.data.timers[queueId];

		if (!timer) {
			streamDeck.logger.error(`No timer found with ID: ${queueId}`);
			ev.action.showAlert();
			return;
		}

		instance.client.timers.updateTimer(queueId, timerAction).catch((error) => {
			streamDeck.logger.error(`Failed to perform timer action '${timerAction}' on timer ID ${queueId}: ${error.message}`);
			ev.action.showAlert();
		});
	}

	override async update(action?: Action<BaseActionSettings<QueueActionSettings>> | undefined): Promise<void> {
		await super.update(action);

		if (!action || !action.isKey()) {
			return;
		}

		const settings = await action.getSettings<BaseActionSettings<QueueActionSettings>>();
		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch (error) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}

		const timer = instance.data.timers[settings.action?.id || ""];

		if (!timer) {
			return;
		}

		action.setState(timer.active ? 0 : 1);
	}
}