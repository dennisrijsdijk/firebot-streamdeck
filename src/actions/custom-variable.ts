import streamDeck, { action, KeyDownEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import firebotManager from "../firebot-manager";
import { setPropertyAtPath } from "../util";
import { FirebotInstance } from "../types/firebot";
import { findAndReplaceVariables } from "../variables";

@action({ UUID: "gg.dennis.firebot.customvariable" })
export class CustomVariableAction extends BaseAction<CustomVariableActionSettings> {
    override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CustomVariableActionSettings>>): Promise<void> {
        await this.waitUntilReady();

        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
            return ev.action.showAlert();
        }

        const variableName = ev.payload.settings.action?.name;
        const variableValue = ev.payload.settings.action?.value || "";
        const propertyPath = ev.payload.settings.action?.propertyPath || "";
        if (!variableName) {
            streamDeck.logger.error(`No custom variable name set for action ${ev.action.id}`);
            return ev.action.showAlert();
        }

        let value: any = variableValue;

        try {
            value = JSON.parse(variableValue);
        } catch { }

        try {
            value = await findAndReplaceVariables(value, { instance, settings: ev.payload.settings, actionId: ev.action.manifestId });
            if (typeof value === "string") {
                value = JSON.parse(value);
            }
        } catch { }

        if (propertyPath && propertyPath.trim() !== "") {
            try {
                value = setPropertyAtPath(
                    instance.data.customVariables[variableName],
                    propertyPath.split('.'),
                    value
                );
            } catch (error) {
                streamDeck.logger.error(`Failed to set property at path ${propertyPath} for custom variable ${variableName} on action ${ev.action.id}`, error);
                return ev.action.showAlert();
            }
        }

        let ttl = await findAndReplaceVariables(ev.payload.settings.action?.duration?.toString() || "", { instance, settings: ev.payload.settings, actionId: ev.action.manifestId }) as string | number;

        if (ttl) {
            ttl = Number(ttl);
            if (isNaN(ttl) || ttl < 0) {
                ttl = 0;
            }
        }

        instance.client.customVariables.setCustomVariable(variableName, value, ttl as number).catch((err) => {
            streamDeck.logger.error(`Failed to set custom variable ${variableName} on action ${ev.action.id}: ${err}`);
            ev.action.showAlert();
        });
    }
}