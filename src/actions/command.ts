import streamDeck, { action, KeyDownEvent, SendToPluginEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";
import { findAndReplaceVariables } from "../variables";

@action({ UUID: "gg.dennis.firebot.command" })
export class CommandAction extends BaseAction<CommandActionSettings> {
	async sendCommands(settings: BaseActionSettings<CommandActionSettings>) {
		await this.waitUntilReady();

		let instance: FirebotInstance | null = null;
		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
		}

		const dataSourcePayload: DataSourcePayload = {
			event: "getCommands",
			items: Object.values(instance?.connected ? instance.data.commands || {} : {}).map(command => ({
				label: command.trigger,
				value: command.id,
			}))
		}

		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async instanceChanged(actionId: string, settings: BaseActionSettings<CommandActionSettings>): Promise<void> {
		await super.instanceChanged(actionId, settings);
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
		const rawArgs = await findAndReplaceVariables(ev.payload.settings.action?.args || "", { instance, settings: ev.payload.settings, actionId: ev.action.manifestId });
		const args = typeof rawArgs === "string" ? rawArgs : JSON.stringify(rawArgs);
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