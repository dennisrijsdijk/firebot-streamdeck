import { action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ActionBaseSettings, CustomRoleSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.CUSTOMROLE) })
export class CustomRole extends ActionBase<CustomRoleSettings> {

    @route(ROUTE.CUSTOMROLE)
    getRoles(request?: MessageRequest<EndpointBody, ActionBaseSettings<CustomRoleSettings>>) {
        let endpoint = request?.body?.endpoint;
        if (endpoint == null) {
            endpoint = "127.0.0.1";
        }
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return [];
        }
        return instance.customRoles.map(role => role.data);
    }

    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<CustomRoleSettings>>): Promise<void> {
        if (
            ev.payload.settings.endpoint == null ||
			ev.payload.settings.action == null ||
			ev.payload.settings.action.id == null
        ) {
            return ev.action.showAlert();
        }

        const maybeInstance = firebotService.instances.find((instance) => {
            return instance.data.endpoint === ev.payload.settings.endpoint;
        });

        if (!maybeInstance) {
            return ev.action.showAlert();
        }

        const maybeRole = maybeInstance.customRoles.find((role) => {
            return role.data.id === ev.payload.settings.action.id;
        });

        if (!maybeRole) {
            return ev.action.showAlert();
        }

        await maybeRole.clear();

        return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
    }
}
