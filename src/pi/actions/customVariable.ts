import PiAction from "../piAction";
import settingsCache from "../settingsCache";
import { ActionBaseSettings, CustomVariableSettings } from "../../types/settings";

class PiCustomVariable implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CustomVariableSettings>;
    }

    private name = document.getElementById('name') as HTMLInputElement;
    private value = document.getElementById('value') as HTMLInputElement;
    private path = document.getElementById('path') as HTMLInputElement;

    async defaultSettings() {
        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                name: "",
                value: "",
                propertyPath: ""
            }
        };

        await settingsCache.saveAction();
    }

    async instanceUpdated() {

    }

    async populateElements() {
        this.name.value = this.settings.action.name;

        this.name.addEventListener('input', async () => {
            this.settings.action.name = this.name.value;
            await settingsCache.saveAction();
        });

        this.value.value = this.settings.action.value;

        this.value.addEventListener('input', async () => {
            this.settings.action.value = this.value.value;
            await settingsCache.saveAction();
        });

        this.path.value = this.settings.action.propertyPath ?? "";

        this.path.addEventListener('input', async () => {
            this.settings.action.propertyPath = this.path.value;
            await settingsCache.saveAction();
        });
    }
}

export default new PiCustomVariable();