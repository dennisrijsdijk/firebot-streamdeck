import PiAction from "../piAction";
import settingsCache from "../settingsCache";

class PiDisplay implements PiAction {
    async defaultSettings(): Promise<void> {
        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: null
        };

        await settingsCache.saveAction();
    }

    async instanceUpdated(): Promise<void> { }

    async populateElements(): Promise<void> { }
}

export default new PiDisplay();