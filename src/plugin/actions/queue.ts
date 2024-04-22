import {action, KeyDownEvent, MessageRequest, MessageResponder, route,} from "@elgato/streamdeck";
import {ActionBase} from "../actionBase";
import {ActionBaseSettings, QueueSettings} from "../../types/settings";

import firebotService from "../firebot-api/service";
import {ACTION, fullActionId, ROUTE} from "../../constants";
import {EndpointBody} from "../../types/routing";

@action({ UUID: fullActionId(ACTION.QUEUE) })
export class Queue extends ActionBase<QueueSettings> {

	@route(ROUTE.QUEUE)
	getQueues(request?: MessageRequest<EndpointBody, ActionBaseSettings<QueueSettings>>, responder?: MessageResponder) {
		let endpoint = request?.body?.endpoint;
		if (endpoint == null) {
			endpoint = "127.0.0.1";
		}
		const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
		if (!instance) {
			return [];
		}
		return instance.queues.map(queue => queue.data);
	}

	async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<QueueSettings>>): Promise<void> {
		if (
			ev.payload.settings.endpoint == null ||
			ev.payload.settings.action == null ||
			ev.payload.settings.action.id == null ||
			ev.payload.settings.action.action == null
		) {
			return ev.action.showAlert();
		}

		const maybeInstance = firebotService.instances.find(instance => {
			return instance.data.endpoint === ev.payload.settings.endpoint;
		});

		if (!maybeInstance) {
			return ev.action.showAlert();
		}

		const maybeQueue = maybeInstance.queues.find(queue => {
			return queue.data.id === ev.payload.settings.action.id;
		});

		if (!maybeQueue) {
			return ev.action.showAlert();
		}

		await maybeQueue.update(ev.payload.settings.action.action);

		return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
	}
}
