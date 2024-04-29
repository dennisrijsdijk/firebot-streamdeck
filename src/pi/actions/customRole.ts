import PiAction from "../piAction";
import { ActionBaseSettings, CustomRoleSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotCustomRoleData } from "../../types/firebot";
import $ from 'jquery';
import settingsCache from "../settingsCache";

class PiCustomRole implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CustomRoleSettings>;
    }

    private async getRoles(endpoint: string): Promise<FirebotCustomRoleData[]> {
        const roles = await streamDeck.plugin.fetch<FirebotCustomRoleData[]>({
            path: ROUTE.CUSTOMROLE,
            body: {
                endpoint: endpoint
            }
        });

        if (!roles.ok || !roles.body) {
            return [];
        }

        return roles.body;
    }

    async defaultSettings(): Promise<void> {
        const roles = await this.getRoles(settingsCache.global.defaultEndpoint);

        let queue: FirebotCustomRoleData | null = null;

        if (roles.length > 0) {
            queue = roles[0];
        }

        settingsCache.action = {
            title: "",
            endpoint: settingsCache.global.defaultEndpoint,
            action: {
                id: queue?.id ?? null
            }
        };

        await settingsCache.saveAction();
    }

    async populateRoles() {
        const roles = await this.getRoles(settingsCache.action.endpoint);

        const roleSelect = $('#role-id-select');

        roleSelect.find('option').remove();

        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];
            roleSelect.append(new Option(
                role.name,
                role.id,
                i === 0,
                role.id === this.settings.action.id
            ));
        }

        const id = roleSelect.find("option:selected").val() as string;

        if (id !== this.settings.action.id) {
            this.settings.action.id = id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        const roleSelect = $('#role-id-select');

        roleSelect.on('change', async () => {
            this.settings.action.id = roleSelect.find("option:selected").val() as string;
            await settingsCache.saveAction();
        });

        await this.populateRoles();
    }

    async instanceUpdated() {
        await this.populateRoles();
    }
}

export default new PiCustomRole();
