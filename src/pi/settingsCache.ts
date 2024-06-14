import { ActionBaseSettings, GlobalSettings } from "../types/settings";
import streamDeck, { JsonObject } from "@elgato/streamdeck";

class SettingsCache {
    global: GlobalSettings;
    action: ActionBaseSettings<JsonObject>;
    constructor() {
        this.global = {
            defaultEndpoint: "",
            instances: []
        };
        this.action = {
            title: "",
            endpoint: "",
            action: { }
        };
    }

    async saveGlobal() {
        return streamDeck.settings.setGlobalSettings(this.global);
    }

    async saveAction() {
        return streamDeck.settings.setSettings(this.action);
    }
}

export default new SettingsCache();