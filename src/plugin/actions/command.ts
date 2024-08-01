import { action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ActionBaseSettings, CommandSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.COMMAND) })
export class Command extends ActionBase<CommandSettings> {

    @route(ROUTE.COMMAND)
    async getCommands(request?: MessageRequest<EndpointBody, ActionBaseSettings<CommandSettings>>) {
        return Object.values((await firebotService.getInstance(request.body.endpoint).commands)).map(command => command.data);
    }

    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<CommandSettings>>): Promise<void> {
        if (
            ev.payload.settings.endpoint == null ||
			ev.payload.settings.action == null ||
			ev.payload.settings.action.id == null ||
			ev.payload.settings.action.args == null
        ) {
            return ev.action.showAlert();
        }

        const instance = firebotService.getInstance(ev.payload.settings.endpoint);

        if (instance.isNull) {
            return ev.action.showAlert();
        }

        const maybeCommand = instance.commands[ev.payload.settings.action.id];

        if (!maybeCommand) {
            return ev.action.showAlert();
        }

        await maybeCommand.run(ev.payload.settings.action.args);

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }
}
