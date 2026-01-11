import streamDeck, { action, KeyDownEvent, SendToPluginEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";
import { FirebotInstance } from "../types/firebot";

@action({ UUID: "gg.dennis.firebot.customrole" })
export class CustomRoleAction extends BaseAction<CustomRoleActionSettings> {
    async sendRoles(settings: BaseActionSettings<CustomRoleActionSettings>) {
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
            event: "getCustomRoles",
            items: Object.values(instance.data.customRoles || {}).map(customRole => ({
                label: customRole.name,
                value: customRole.id,
            }))
        }

        await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
    }

    override async instanceChanged(actionId: string, settings: BaseActionSettings<CustomRoleActionSettings>): Promise<void> {
        return this.sendRoles(settings);
    }

    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CustomRoleActionSettings>>): Promise<void> {
        if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCustomRoles") {
            return;
        }

        const settings = await ev.action.getSettings();
        return this.sendRoles(settings);
    }

    override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CustomRoleActionSettings>>): Promise<void> {
        await this.waitUntilReady();
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
            return ev.action.showAlert();
        }

        const customRoleId = ev.payload.settings.action?.id;
        if (!customRoleId) {
            streamDeck.logger.error(`No custom role ID set for action ${ev.action.id}`);
            return ev.action.showAlert();
        }

        const customRole = instance.data.customRoles[customRoleId];

        if (!customRole) {
            streamDeck.logger.error(`No custom role found with ID: ${customRoleId} for action ${ev.action.id}`);
            return ev.action.showAlert();
        }

        instance.client.customRoles.clearCustomRoleViewers(customRoleId).catch(error => {
            streamDeck.logger.error(`Failed to clear viewers for custom role ${customRoleId} on action ${ev.action.id}: ${error}`);
            ev.action.showAlert();
        });
    }
}