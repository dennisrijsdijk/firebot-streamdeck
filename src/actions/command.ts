import streamDeck, { action, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.command" })
export class CommandAction extends BaseAction<CommandActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CommandActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCommands") {
			return;
		}

		const settings = await ev.action.getSettings();

		await this.waitUntilReady();

		const instance = firebotManager.getInstance(settings.endpoint || "");
		if (!instance) {
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

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<CommandActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		await this.populateSettings(ev, {
			id: "",
			args: ""
		});
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CommandActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return;
		}
		const commandId = ev.payload.settings.action?.id;
		const args = ev.payload.settings.action?.args || "";
		if (!commandId) {
			streamDeck.logger.error(`No command ID set for action ${ev.action.id}`);
			return;
		}
		const command = instance.data.commands[commandId];
		if (!command) {
			streamDeck.logger.error(`No command found with ID: ${commandId}`);
			return;
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