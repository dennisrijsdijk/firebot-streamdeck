import streamDeck, { Action, action, KeyDownEvent, SendToPluginEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

@action({ UUID: "gg.dennis.firebot.timer" })
export class TimerAction extends BaseAction<TimerActionSettings> {
	async sendTimers(settings: BaseActionSettings<TimerActionSettings>) {
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
			event: "getTimers",
			items: Object.values(instance.data.timers || {}).map(timer => ({
				label: timer.name,
				value: timer.id,
			}))
		}
		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async instanceChanged(actionId: string, settings: BaseActionSettings<TimerActionSettings>): Promise<void> {
		return this.sendTimers(settings);
	}

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<TimerActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getTimers") {
			return;
		}

		const settings = await ev.action.getSettings();
		await this.sendTimers(settings);
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<TimerActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return ev.action.showAlert();
		}

		const queueId = ev.payload.settings.action?.id || "";
		const timerAction = ev.payload.settings.action?.action;

		if (timerAction == null) {
			streamDeck.logger.warn(`No timer action set for action ${ev.action.id}`);
			return ev.action.showAlert();
		}

		const timer = instance.data.timers[queueId];

		if (!timer) {
			streamDeck.logger.error(`No timer found with ID: ${queueId}`);
			return ev.action.showAlert();
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