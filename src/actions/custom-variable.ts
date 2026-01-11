import streamDeck, { action, KeyDownEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import firebotManager from "../firebot-manager";
import { setPropertyAtPath } from "../util";
import { FirebotInstance } from "../types/firebot";

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

        let value = variableValue;

        try {
            value = JSON.parse(variableValue);
        } catch {
            // Ignore JSON parse errors, just use the string value
        }

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

        instance.client.customVariables.setCustomVariable(variableName, value).catch((err) => {
            streamDeck.logger.error(`Failed to set custom variable ${variableName} on action ${ev.action.id}: ${err}`);
            ev.action.showAlert();
        });
    }
}