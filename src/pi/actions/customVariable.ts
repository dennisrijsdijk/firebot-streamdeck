import PiAction from "../piAction";
import settingsCache from "../settingsCache";
import {ActionBaseSettings, CustomVariableSettings} from "../../types/settings";
import $ from 'jquery';

class PiCustomVariable implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CustomVariableSettings>;
    }

    async defaultSettings() {
        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                name: "",
                value: ""
            }
        };

        await settingsCache.saveAction();
    }

    async instanceUpdated() {

    }

    async populateElements() {
        const customVariableName = $('#customVariable-name');
        const customVariableValue = $('#customVariable-value');

        customVariableName.val(this.settings.action.name);

        customVariableName.on('input', async () => {
            this.settings.action.name = customVariableName.val() as string;
            await settingsCache.saveAction();
        });

        customVariableValue.val(this.settings.action.value);

        customVariableValue.on('input', async () => {
            this.settings.action.value = customVariableValue.val() as string;
            await settingsCache.saveAction();
        });
    }
}

export default new PiCustomVariable();