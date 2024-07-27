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
        return Object.values(firebotService.getInstance(request.body.endpoint).customRoles).map(role => role.data);
    }

    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<CustomRoleSettings>>): Promise<void> {
        if (
            ev.payload.settings.endpoint == null ||
			ev.payload.settings.action == null ||
			ev.payload.settings.action.id == null
        ) {
            return ev.action.showAlert();
        }

        const instance = firebotService.getInstance(ev.payload.settings.endpoint);

        if (instance.isNull) {
            return ev.action.showAlert();
        }

        const maybeRole = instance.customRoles[ev.payload.settings.action.id];

        if (!maybeRole) {
            return ev.action.showAlert();
        }

        await maybeRole.clear();

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }
}
