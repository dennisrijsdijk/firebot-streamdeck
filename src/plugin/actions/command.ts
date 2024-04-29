import {action, KeyDownEvent, MessageRequest, MessageResponder, route,} from "@elgato/streamdeck";
import {ActionBase} from "../actionBase";
import {ActionBaseSettings, CommandSettings} from "../../types/settings";

import firebotService from "../firebot-api/service";
import {ACTION, fullActionId, ROUTE} from "../../constants";
import {EndpointBody} from "../../types/routing";

@action({ UUID: fullActionId(ACTION.COMMAND) })
export class Command extends ActionBase<CommandSettings> {

	@route(ROUTE.COMMAND)
	async getCommands(request?: MessageRequest<EndpointBody, ActionBaseSettings<CommandSettings>>, responder?: MessageResponder) {
		let endpoint = request?.body?.endpoint;
		if (endpoint == null) {
			endpoint = "127.0.0.1";
		}
		const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
		if (!instance) {
			return [];
		}
		return (await instance.getCommands()).map(command => command.data);
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

		const maybeInstance = firebotService.instances.find(instance => {
			return instance.data.endpoint === ev.payload.settings.endpoint;
		});

		if (!maybeInstance) {
			return ev.action.showAlert();
		}

		const maybeCommand = (await maybeInstance.getCommands()).find(command => {
			return command.data.id === ev.payload.settings.action.id;
		});

		if (!maybeCommand) {
			return ev.action.showAlert();
		}

		await maybeCommand.run(ev.payload.settings.action.args);

		return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
	}
}
