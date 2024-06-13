import PiAction from "../piAction";
import { ActionBaseSettings, PresetEffectListSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotPresetEffectListData } from "../../types/firebot";
import * as dom from '../dom';
import settingsCache from "../settingsCache";

class PiPresetEffectList implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<PresetEffectListSettings>;
    }

    private arguments = document.getElementById('arguments') as HTMLDivElement;
    private id = document.getElementById('id') as HTMLSelectElement;

    private async getPresetLists(endpoint: string): Promise<FirebotPresetEffectListData[]> {
        const presetLists = await streamDeck.plugin.fetch<FirebotPresetEffectListData[]>({
            path: ROUTE.PRESETLIST,
            body: {
                endpoint: endpoint
            }
        });

        if (!presetLists.ok || !presetLists.body) {
            return [];
        }

        return presetLists.body;
    }

    async defaultSettings(): Promise<void> {
        const presetLists = await this.getPresetLists(settingsCache.global.defaultEndpoint);

        let presetList: FirebotPresetEffectListData | null = null;

        if (presetLists.length > 0) {
            presetList = presetLists[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: presetList?.id ?? null,
                arguments: {}
            }
        };

        await settingsCache.saveAction();
    }

    async populatePresetLists() {
        const presetLists = await this.getPresetLists(settingsCache.action.endpoint);

        this.id.innerHTML = '';

        for (const presetList of presetLists) {
            this.id.add(dom.createOption(presetList.name, presetList.id, presetList.id === this.settings.action.id));
        }

        if (this.id.value !== this.settings.action.id) {
            this.id.value = presetLists[0].id;
            this.settings.action.id = presetLists[0].id;
            await settingsCache.saveAction();
        }

        const maybeList = presetLists.find(list => list.id === this.settings.action.id);

        this.populatePresetListArgs(maybeList?.args ?? []);
    }

    populatePresetListArgs(args: string[]) {
        this.arguments.innerHTML = '';

        for (const arg of args) {
            const sdpiItem = document.createElement("div");
            sdpiItem.classList.add("sdpi-item");

            const sdpiItemLabel = document.createElement("div");
            sdpiItemLabel.classList.add("sdpi-item-label");
            sdpiItemLabel.innerText = arg;

            const sdpiItemValue = document.createElement("input");
            sdpiItemValue.value = this.settings.action.arguments[arg] ?? "";
            sdpiItemValue.addEventListener('input', async () => {
                this.settings.action.arguments[arg] = sdpiItemValue.value;
                await settingsCache.saveAction();
            });

            sdpiItem.appendChild(sdpiItemLabel);
            sdpiItem.appendChild(sdpiItemValue);

            this.arguments.appendChild(sdpiItem);
        }
    }

    async populateElements(): Promise<void> {
        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            const lists = await this.getPresetLists(this.settings.endpoint);
            const maybeList = lists.find(list => list.id === this.settings.action.id);
            this.populatePresetListArgs(maybeList?.args || []);
            await settingsCache.saveAction();
        });

        await this.populatePresetLists();
    }

    async instanceUpdated() {
        await this.populatePresetLists();
    }
}

export default new PiPresetEffectList();
