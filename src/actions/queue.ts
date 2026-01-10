import streamDeck, { Action, action, DidReceiveSettingsEvent, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

const actionQueueCache: Record<string, string> = {};

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.queue" })
export class QueueAction extends BaseAction<QueueActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<QueueActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload)) {
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

		if (ev.payload.event === "getEffectQueues") {
			const dataSourcePayload: DataSourcePayload = {
				event: ev.payload.event as string,
				items: Object.values(instance.data.queues || {}).map(queue => ({
					label: queue.name,
					value: queue.id,
				}))
			}
			await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
		} else if (ev.payload.event === "getEffectQueueActions") {
			await this.sendQueueActions(settings);
		}
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<BaseActionSettings<QueueActionSettings>>): Promise<void> {
		await super.onDidReceiveSettings(ev);

		if (actionQueueCache[ev.action.id] !== ev.payload.settings.action?.id) {
			await this.sendQueueActions(ev.payload.settings);
		}

		actionQueueCache[ev.action.id] = ev.payload.settings.action?.id || "";
	}

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<QueueActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		await this.populateSettings(ev, {
			id: "",
			action: "",
		});

		actionQueueCache[ev.action.id] = ev.payload.settings.action?.id || "";
	}

	override async onWillDisappear(ev: WillDisappearEvent<BaseActionSettings<QueueActionSettings>>): Promise<void> {
		await super.onWillDisappear(ev);

		delete actionQueueCache[ev.action.id];
	}

	async sendQueueActions(settings: BaseActionSettings<QueueActionSettings>): Promise<void> {
		const instance = firebotManager.getInstance(settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}

		if (!instance.connected) {
			streamDeck.logger.error(`Not connected to Firebot instance at endpoint: ${settings.endpoint}, refusing to serve stale data.`);
			return;
		}

		const queue = instance.data.queues[settings.action?.id || ""];
		if (!queue) {
			return;
		}

		const dataSourcePayload: DataSourcePayload = {
			event: "getEffectQueueActions",
			items: []
		};

		if (queue.type !== "manual") {
			dataSourcePayload.items.push(
				{ label: "Pause", value: "pause" },
				{ label: "Resume", value: "resume" },
				{ label: "Toggle", value: "toggle" },
			);
		} else {
			dataSourcePayload.items.push({ label: "Trigger Next Effect", value: "trigger" });
		}
		dataSourcePayload.items.push({ label: "Clear", value: "clear" });

		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<QueueActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return;
		}
		const queueId = ev.payload.settings.action?.id || "";
		const queueAction = ev.payload.settings.action?.action;

		if (queueAction == null || queueAction === "") {
			streamDeck.logger.warn(`No queue action set for action ${ev.action.id}`);
			ev.action.showAlert();
			return;
		}

		const queue = instance.data.queues[queueId];

		if (!queue) {
			streamDeck.logger.error(`No effect queue found with ID: ${queueId}`);
			ev.action.showAlert();
			return;
		}

		if (queue.type !== "manual" && (queueAction === "trigger")) {
			streamDeck.logger.error(`Cannot trigger next effect on a non-manual queue (ID: ${queueId})`);
			ev.action.showAlert();
			return;
		}

		if (queue.type === "manual" && (queueAction === "pause" || queueAction === "resume" || queueAction === "toggle")) {
			streamDeck.logger.error(`Cannot ${queueAction} a manual queue (ID: ${queueId})`);
			ev.action.showAlert();
			return;
		}

		try {
			if (queueAction === "trigger") {
				await instance.client.queues.triggerEffectQueue(queueId);
			} else {
				await instance.client.queues.updateEffectQueue(queueId, queueAction);
			}
		} catch (error) {
			streamDeck.logger.error(`Failed to perform queue action '${queueAction}' on queue ID ${queueId}: ${(error as Error).message}`);
			ev.action.showAlert();
		}
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

		const queue = instance.data.queues[settings.action?.id || ""];

		if (!queue) {
			return;
		}

		action.setState(queue.active ? 0 : 1);
	}
}