import { ACTION, fullActionId } from "../../constants";
import { action, JsonValue, KeyDownEvent } from "@elgato/streamdeck";
import { ActionBaseSettings, CustomVariableSettings } from "../../types/settings";
import { ActionBase } from "../actionBase";
import firebotService from "../firebot-api/service";

@action({ UUID: fullActionId(ACTION.CUSTOMVARIABLE) })
export class CustomVariable extends ActionBase<CustomVariableSettings> {
    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<CustomVariableSettings>>) {
        if (
            ev.payload.settings.endpoint == null ||
            ev.payload.settings.action == null ||
            ev.payload.settings.action.name == null ||
            ev.payload.settings.action.value == null
        ) {
            return ev.action.showAlert();
        }

        const maybeInstance = firebotService.instances.find((instance) => {
            return instance.data.endpoint === ev.payload.settings.endpoint;
        });

        if (!maybeInstance) {
            return ev.action.showAlert();
        }

        let value: JsonValue = ev.payload.settings.action.value;
        if (!isNaN(Number(value))) {
            value = Number(value);
        } else if (value.startsWith('{') || value.startsWith('[')) {
            try {
                value = JSON.parse(value);
            } catch (error) { }
        }

        let result: boolean;

        if (ev.payload.settings.action.propertyPath == null || ev.payload.settings.action.propertyPath === "") {
            result = await maybeInstance.setCustomVariable(ev.payload.settings.action.name, value);
        } else {
            result = await maybeInstance.setCustomVariableWithPath(
                ev.payload.settings.action.name,
                value,
                ev.payload.settings.action.propertyPath
            );
        }

        if (result) {
            return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
        }
        return ev.action.showAlert();
    }
}