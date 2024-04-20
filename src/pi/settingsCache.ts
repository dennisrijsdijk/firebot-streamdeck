import {ActionBaseSettings, GlobalSettings} from "../types/settings";
import EventEmitter from "eventemitter3";
import streamDeck from "@elgato/streamdeck";

class SettingsCache extends EventEmitter {
    global: GlobalSettings;
    action: ActionBaseSettings<any>;
    constructor() {
        super();
        this.global = {
            defaultEndpoint: "",
            instances: [ ]
        };
        this.action = {
            title: "",
            endpoint: "",
            action: null
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