import PiAction from "../piAction";
import { ActionBaseSettings, CustomRoleSettings } from "../../types/settings";
import streamDeck from "@elgato/streamdeck";
import { ROUTE } from "../../constants";
import { FirebotCustomRoleData } from "../../types/firebot";
import * as dom from '../dom';
import settingsCache from "../settingsCache";

class PiCustomRole implements PiAction {
    private get settings() {
        return settingsCache.action as ActionBaseSettings<CustomRoleSettings>;
    }

    private id = document.getElementById('id') as HTMLSelectElement;

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

        this.id.innerHTML = '';

        for (const role of roles) {
            this.id.add(dom.createOption(role.name, role.id, role.id === this.settings.action.id));
        }

        if (this.id.value !== this.settings.action.id) {
            this.id.value = roles[0].id
            this.settings.action.id = roles[0].id;
            await settingsCache.saveAction();
        }
    }

    async populateElements(): Promise<void> {
        this.id.addEventListener('change', async () => {
            this.settings.action.id = this.id.value;
            await settingsCache.saveAction();
        });

        await this.populateRoles();
    }

    async instanceUpdated() {
        await this.populateRoles();
    }
}

export default new PiCustomRole();
