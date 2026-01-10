import streamDeck, { action, KeyDownEvent, SendToPluginEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import { JsonValue } from "@elgato/utils";
import firebotManager from "../firebot-manager";
import { DataSourcePayload } from "../types/sdpi-components";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.customrole" })
export class CustomRoleAction extends BaseAction<CustomRoleActionSettings> {
    override async onSendToPlugin(ev: SendToPluginEvent<JsonValue, BaseActionSettings<CustomRoleActionSettings>>): Promise<void> {
        if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getCustomRoles") {
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
            event: "getCustomRoles",
            items: Object.values(instance.data.customRoles || {}).map(customRole => ({
                label: customRole.name,
                value: customRole.id,
            }))
        }

        await streamDeck.ui.sendToPropertyInspector(dataSourcePayload);
    }

    override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<CustomRoleActionSettings>>): Promise<void> {
        await super.onWillAppear(ev);

        await this.populateSettings(ev, { id: "" });
    }

    override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CustomRoleActionSettings>>): Promise<void> {
        await this.waitUntilReady();
        const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
        if (!instance) {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
            return;
        }

        const customRoleId = ev.payload.settings.action?.id;
        if (!customRoleId) {
            streamDeck.logger.error(`No custom role ID set for action ${ev.action.id}`);
            return;
        }

        const customRole = instance.data.customRoles[customRoleId];

        if (!customRole) {
            streamDeck.logger.error(`No custom role found with ID: ${customRoleId} for action ${ev.action.id}`);
            return;
        }

        instance.client.customRoles.clearCustomRoleViewers(customRoleId).catch(error => {
            streamDeck.logger.error(`Failed to clear viewers for custom role ${customRoleId} on action ${ev.action.id}: ${error}`);
            ev.action.showAlert();
        });
    }
}