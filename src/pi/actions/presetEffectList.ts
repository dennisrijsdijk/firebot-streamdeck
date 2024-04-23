import PiAction from "../piAction";
import {ActionBaseSettings, PresetEffectListSettings} from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import {ROUTE} from "../../constants";
import {FirebotPresetEffectListData} from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiPresetEffectList implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<PresetEffectListSettings>;
    }

    private async getPresetLists(endpoint: string): Promise<FirebotPresetEffectListData[]> {
        const presetLists = await streamDeck.plugin.fetch<FirebotPresetEffectListData[]>({
            path: ROUTE.PRESETLIST,
            body: {
                endpoint: endpoint,
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
                arguments: {},
            }
        };

        await settingsCache.saveAction();
    }

    async populatePresetLists() {
        const presetLists = await this.getPresetLists(settingsCache.action.endpoint);

        const presetListSelect = $('#presetlist-id-select');

        presetListSelect.find('option').remove();

        for (let i = 0; i < presetLists.length; i++) {
            const presetList = presetLists[i];
            presetListSelect.append(new Option(
                presetList.name,
                presetList.id,
                i === 0,
                presetList.id === this.settings.action.id
            ));
        }

        const id = presetListSelect.find("option:selected").val() as string;

        if (id !== this.settings.action.id) {
            this.settings.action.id = id;
            await settingsCache.saveAction();
        }

        const maybeList = presetLists.find(list => list.id === this.settings.action.id);

        this.populatePresetListArgs(maybeList?.args ?? [ ]);
    }

    populatePresetListArgs(args: string[]) {
        const presetListArgsContainer = $('#preset-list-arg-container');
        presetListArgsContainer.find('div').remove();

        for (let arg of args) {
            //language=HTML
            const sdpi_item = $(`
                <div class="sdpi-item">
                    <div class="sdpi-item-label">${arg}</div>
                </div>
            `);
            const sdpi_item_value = $(`<input class="sdpi-item-value" placeholder="Argument Value">`);

            sdpi_item_value.val(this.settings.action.arguments[arg] ?? "");
            sdpi_item_value.on('input', async () => {
                this.settings.action.arguments[arg] = sdpi_item_value.val() as string;
                await settingsCache.saveAction();
            });

            sdpi_item.append(sdpi_item_value);
            presetListArgsContainer.append(sdpi_item);
        }
    }

    async populateElements(): Promise<void> {
        const presetListSelect = $('#presetlist-id-select');

        presetListSelect.on('change', async () => {
            this.settings.action.id = presetListSelect.find("option:selected").val() as string;
            const lists = await this.getPresetLists(this.settings.endpoint);
            const maybeList = lists.find(list => list.id === this.settings.action.id);
            this.populatePresetListArgs(maybeList?.args || [ ]);
            await settingsCache.saveAction();
        });

        await this.populatePresetLists();
    }

    async instanceUpdated() {
        await this.populatePresetLists();
    }
}

export default new PiPresetEffectList();
