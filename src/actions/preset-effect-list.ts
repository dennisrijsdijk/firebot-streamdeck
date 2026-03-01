import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, PropertyInspectorDidAppearEvent, SendToPluginEvent, WillAppearEvent, WillDisappearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { FirebotInstance } from "../types/firebot";
import { findAndReplaceVariables } from "../variables";

const actionPresetListsCache: Record<string, string> = {};

@action({ UUID: "gg.dennis.firebot.presetlist" })
export class PresetListAction extends BaseAction<PresetListActionSettings> {
	override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getPresetLists") {
			return;
		}

		const settings = await ev.action.getSettings();
		await this.sendPresetLists(settings);
		return this.sendPresetListArgsToPI(ev.action.id);
	}

	override async instanceChanged(actionId: string, settings: BaseActionSettings<PresetListActionSettings>): Promise<void> {
		await super.instanceChanged(actionId, settings);
		await this.sendPresetLists(settings);
		await this.sendPresetListArgsToPI(actionId);
	}

	async sendPresetLists(settings: BaseActionSettings<PresetListActionSettings>) {
		await this.waitUntilReady();

		let instance: FirebotInstance | null = null;

		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
		}

		let dataSourcePayload: { event: string; items: any[] };

		dataSourcePayload = {
			event: "getPresetLists",
			items: Object.values(instance?.connected ? instance.data.presetEffectLists || {} : {}).map(presetList => ({
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
			return streamDeck.ui.sendToPropertyInspector({ event: "getPresetListArgs", items: [] });
		}

		const settings = await action.getSettings<BaseActionSettings<PresetListActionSettings>>();

		await this.waitUntilReady();

		let instance: FirebotInstance | null = null;

		try {
			instance = firebotManager.getInstance(settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings.endpoint}`);
		}

		const presetListId = (instance?.connected ? settings.action?.id : "") || "";

		let presetList = instance?.data.presetEffectLists?.[presetListId];
		if (!presetList) {
			presetList = {
				id: "",
				name: "",
				argumentNames: []
			};
		}
		const dataSourcePayload: { event: string; items: any[] } = {
			event: "getPresetListArgs",
			items: presetList.argumentNames.map(name => ({
				label: name,
				value: settings.action?.arguments?.[name] || "",
			}))
		};

		return streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
	}

	override async onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await this.sendPresetListArgsToPI(ev.action.id);
	}

	override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await super.onWillAppear(ev);

		actionPresetListsCache[ev.action.id] = ev.payload.settings.action?.id || "";
	}

	override async onWillDisappear(ev: WillDisappearEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await super.onWillDisappear(ev);

		delete actionPresetListsCache[ev.action.id];
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await super.onDidReceiveSettings(ev);
		if (actionPresetListsCache[ev.action.id] === ev.payload.settings.action?.id) {
			return;
		}

		actionPresetListsCache[ev.action.id] = ev.payload.settings.action?.id || "";
		await this.sendPresetListArgsToPI(ev.action.id);
	}

	override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<PresetListActionSettings>>): Promise<void> {
		await this.waitUntilReady();
		let instance: FirebotInstance;

		try {
			instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
		} catch {
			streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
			return ev.action.showAlert();
		}

		const presetListId = ev.payload.settings.action?.id;
		const presetListArgs = ev.payload.settings.action?.arguments || {};
		if (!presetListId) {
			streamDeck.logger.error(`No preset effect list ID set for action ${ev.action.id}`);
			return ev.action.showAlert();
		}

		Object.entries(presetListArgs).forEach(async ([key, value]) => {
			if (typeof value !== "string") {
				return;
			}
			
			const rawValue = await findAndReplaceVariables(value, { instance, settings: ev.payload.settings, actionId: ev.action.manifestId });
			presetListArgs[key] = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
		});

		instance.client.effects.runPresetEffectList(presetListId, false, presetListArgs).catch((err) => {
			streamDeck.logger.error(`Failed to run preset effect list: ${err.message}`);
			ev.action.showAlert();
		});
	}
}