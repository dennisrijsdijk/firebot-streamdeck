import PiAction from "../piAction";
import { ActionBaseSettings, CommandSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotCommandData } from "../../types/firebot";
import * as dom from '../dom';
import settingsCache from "../settingsCache";

class PiCommand implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CommandSettings>;
    }

    private id = document.getElementById('id') as HTMLSelectElement;

    private arguments = document.getElementById('arguments') as HTMLInputElement;

    private async getCommands(endpoint: string): Promise<FirebotCommandData[]> {
        const commands = await streamDeck.plugin.fetch<FirebotCommandData[]>({
            path: ROUTE.COMMAND,
            body: {
                endpoint: endpoint
            }
        });

        if (!commands.ok || !commands.body) {
            return [];
        }

        return commands.body;
    }

    async defaultSettings(): Promise<void> {
        const commands = await this.getCommands(settingsCache.global.defaultEndpoint);

        let command: FirebotCommandData | null = null;

        if (commands.length > 0) {
            command = commands[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: command?.id ?? null,
                args: ""
            }
        };

        await settingsCache.saveAction();
    }

    async populateCommands() {
        const commands = await this.getCommands(settingsCache.action.endpoint);

        this.id.innerHTML = "";

        for (let idx = 0; idx < commands.length; idx++) {
            const command = commands[idx];
            const option = dom.createOption(command.trigger, command.id, command.id === this.settings.action.id);
            this.id.add(option);
        }

        if (this.id.value !== this.settings.action.id && commands.length > 0) {
            this.settings.action.id = commands[0].id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            await settingsCache.saveAction();
        });

        this.arguments.value = this.settings.action.args;

        this.arguments.addEventListener('input', async () => {
            this.settings.action.args = this.arguments.value;
            await settingsCache.saveAction();
        });

        await this.populateCommands();
    }

    async instanceUpdated() {
        await this.populateCommands();
    }
}

export default new PiCommand();
