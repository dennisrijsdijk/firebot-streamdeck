import streamDeck, { action, KeyDownEvent, SendToPluginEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

@action({ UUID: "gg.dennis.firebot.command" })
export class CommandAction extends BaseAction<CommandActionSettings> {
	async sendCommands(settings: BaseActionSettings<CommandActionSettings>) {
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
			event: "getCommands",
			items: Object.values(instance.data.commands || {}).map(command => ({
				label: command.trigger,
				value: command.id,
			}))
		}

		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async instanceChanged(actionId: string, settings: BaseActionSettings<CommandActionSettings>): Promise<void> {
		return this.sendCommands(settings);
	}

	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CommandActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCommands") {
			return;
		}

		const settings = await ev.action.getSettings();

		return this.sendCommands(settings);
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CommandActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return ev.action.showAlert();
		}

		const commandId = ev.payload.settings.action?.id;
		const args = ev.payload.settings.action?.args || "";
		if (!commandId) {
			streamDeck.logger.error(`No command ID set for action ${ev.action.id}`);
			return ev.action.showAlert();
		}
		const command = instance.data.commands[commandId];
		if (!command) {
			streamDeck.logger.error(`No command found with ID: ${commandId}`);
			return ev.action.showAlert();
		}

		try {
			if (command.type === "system") {
				await instance.client.commands.runSystemCommand(commandId, args);
			} else if (command.type === "custom") {
				await instance.client.commands.runCustomCommand(commandId, args);
			}
		} catch (err) {
			streamDeck.logger.error(`Failed to run command: ${(err as Error).message}`);
			ev.action.showAlert();
		}
	}
}