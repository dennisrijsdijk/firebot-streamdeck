import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, PropertyInspectorDidAppearEvent, SendToPluginEvent, SingletonAction, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";

const actionPresetListsCache: Record<string, string> = {};

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.presetlist" })
export class PresetListAction extends BaseAction<PresetListActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload)) {
			return;
		}

		if (ev.payload.event !== "getPresetLists") {
			return;
		}

		const settings = await ev.action.getSettings();

		await this.waitUntilReady();

		const instance = firebotManager.getInstance(settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}

		let dataSourcePayload: { event: string; items: any[] };

		dataSourcePayload = {
			event: "getPresetLists",
			items: Object.values(instance.data.presetEffectLists || {}).map(presetList => ({
				label: presetList.name,
				value: presetList.id,
			}))
		};

		await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	async sendPresetListArgsToPI(actionId: string): Promise<void> {
		const action = streamDeck.actions.getActionById(actionId);

		if (!action) {
			streamDeck.logger.error(`No action found with ID: ${actionId}`);
			return;
		}

		const settings = await action.getSettings<BaseActionSettings<PresetListActionSettings>>();

		await this.waitUntilReady();

		const instance = firebotManager.getInstance(settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
			return;
		}
		const presetListId = settings.action?.presetListId;
		if (!presetListId) {
			streamDeck.logger.error(`No preset effect list ID set for action ${actionId}`);
			return;
		}
		const presetList = instance.data.presetEffectLists?.[presetListId];
		if (!presetList) {
			streamDeck.logger.error(`No preset effect list found with ID ${presetListId} for action ${actionId}`);
			return;
		}
		const dataSourcePayload: { event: string; items: any[] } = {
			event: "getPresetListArgs",
			items: presetList.argumentNames.map(name => ({
				label: name,
				value: settings.action?.presetListArgs?.[name] || "",
			}))
		};

		return streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await this.sendPresetListArgsToPI(ev.action.id);
	}

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		await this.populateSettings(ev, {
			presetListId: "",
			presetListArgs: {}
		});

		actionPresetListsCache[ev.action.id] = ev.payload.settings.action?.presetListId || "";
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await super.onDidReceiveSettings(ev);

		if (actionPresetListsCache[ev.action.id] !== ev.payload.settings.action?.presetListId) {
			actionPresetListsCache[ev.action.id] = ev.payload.settings.action?.presetListId || "";
			await this.sendPresetListArgsToPI(ev.action.id);
		}
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		if (!instance) {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return;
		}

		const presetListId = ev.payload.settings.action?.presetListId;
		const presetListArgs = ev.payload.settings.action?.presetListArgs || {};
		if (!presetListId) {
			streamDeck.logger.error(`No preset effect list ID set for action ${ev.action.id}`);
			return;
		}

		instance.client.effects.runPresetEffectList(presetListId, false, presetListArgs).catch((err) => {
			streamDeck.logger.error(`Failed to run preset effect list: ${err.message}`);
			ev.action.showAlert();
		});
	}
}