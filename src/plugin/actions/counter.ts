import {
	action,
	KeyDownEvent,
	MessageRequest,
	MessageResponder,
	route,
} from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ActionBaseSettings, CounterSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import {ACTION, PLUGIN, ROUTE} from "../../constants";
import {EndpointBody} from "../../types/routing";

@action({ UUID: `${PLUGIN}.${ACTION.COUNTER}` })
export class Counter extends ActionBase<CounterSettings> {

	@route(ROUTE.COUNTER)
	getCounters(request?: MessageRequest<EndpointBody, ActionBaseSettings<CounterSettings>>, responder?: MessageResponder) {
		let endpoint = request?.body?.endpoint;
		if (endpoint == null) {
			endpoint = "127.0.0.1";
		}
		const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
		if (!instance) {
			return [];
		}
		return instance.counters.map(counter => counter.data);
	}

	async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<CounterSettings>>): Promise<void> {
		if (
			ev.payload.settings.endpoint == null ||
			ev.payload.settings.action == null ||
			ev.payload.settings.action.id == null ||
			ev.payload.settings.action.action == null ||
			ev.payload.settings.action.value == null
		) {
			return ev.action.showAlert();
		}

		const maybeInstance = firebotService.instances.find(instance => {
			return instance.data.endpoint === ev.payload.settings.endpoint;
		});

		if (!maybeInstance) {
			return ev.action.showAlert();
		}

		const maybeCounter = maybeInstance.counters.find(counter => {
			return counter.data.id === ev.payload.settings.action.id;
		});

		if (!maybeCounter) {
			return ev.action.showAlert();
		}

		await maybeCounter.updateByMode(ev.payload.settings.action.value, ev.payload.settings.action.action == "set");

		return this.update(ev.action, ev.payload.settings);
	}
}
