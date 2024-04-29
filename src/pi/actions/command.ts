import PiAction from "../piAction";
import { ActionBaseSettings, CommandSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotCommandData } from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiCommand implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CommandSettings>;
    }

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
        const commandSelect = $('#queue-id-select');
        const systemCommandOptGroup = $('#sdpi-system-commands-optgroup');
        const customCommandOptGroup = $('#sdpi-custom-commands-optgroup');

        systemCommandOptGroup.find('option').remove();
        customCommandOptGroup.find('option').remove();

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const optGroup = command.type === "system" ? systemCommandOptGroup : customCommandOptGroup;
            optGroup.append(new Option(
                command.trigger,
                command.id,
                i === 0,
                command.id === this.settings.action.id
            ));
        }

        const id = commandSelect.find("option:selected").val() as string;

        if (id !== this.settings.action.id) {
            this.settings.action.id = id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        const commandSelect = $('#command-id-select');
        const commandArgs = $('#command-args');

        commandSelect.on('change', async () => {
            this.settings.action.id = commandSelect.find("option:selected").val() as string;
            await settingsCache.saveAction();
        });

        commandArgs.val(this.settings.action.args);

        commandArgs.on('input', async () => {
            this.settings.action.args = commandArgs.val() as string;
            await settingsCache.saveAction();
        });

        await this.populateCommands();
    }

    async instanceUpdated() {
        await this.populateCommands();
    }
}

export default new PiCommand();
