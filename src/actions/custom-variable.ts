import streamDeck, { action, KeyDownEvent, WillAppearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";
import firebotManager from "../firebot-manager";
import { setPropertyAtPath } from "../util";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.customvariable" })
export class CustomVariableAction extends BaseAction<CustomVariableActionSettings> {
    override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<CustomVariableActionSettings>>): Promise<void> {
        await super.onWillAppear(ev);

        await this.populateSettings(ev, {});
    }

    override async onKeyDown(ev: KeyDownEvent<BaseActionSettings<CustomVariableActionSettings>>): Promise<void> {
        await this.waitUntilReady();
        const instance = firebotManager.getInstance(ev.payload.settings.endpoint || "");
        if (!instance) {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${ev.payload.settings.endpoint}`);
            return;
        }
        const variableName = ev.payload.settings.action?.name;
        const variableValue = ev.payload.settings.action?.value || "";
        const propertyPath = ev.payload.settings.action?.propertyPath || "";
        if (!variableName) {
            streamDeck.logger.error(`No custom variable name set for action ${ev.action.id}`);
            return;
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
                ev.action.showAlert();
                return;
            }
        }

        instance.client.customVariables.setCustomVariable(variableName, value).catch((err) => {
            streamDeck.logger.error(`Failed to set custom variable ${variableName} on action ${ev.action.id}: ${err}`);
            ev.action.showAlert();
        });
    }
}