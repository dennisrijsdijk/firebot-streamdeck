import {Action, action, KeyDownEvent, MessageRequest, MessageResponder, route,} from "@elgato/streamdeck";
import {ActionBase} from "../actionBase";
import {ActionBaseSettings, QueueSettings, TimerSettings} from "../../types/settings";

import firebotService from "../firebot-api/service";
import {ACTION, fullActionId, ROUTE} from "../../constants";
import {EndpointBody} from "../../types/routing";

@action({ UUID: fullActionId(ACTION.TIMER) })
export class Timer extends ActionBase<TimerSettings> {

	@route(ROUTE.TIMER)
	getQueues(request?: MessageRequest<EndpointBody, ActionBaseSettings<TimerSettings>>, responder?: MessageResponder) {
		let endpoint = request?.body?.endpoint;
		if (endpoint == null) {
			endpoint = "127.0.0.1";
		}
		const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
		if (!instance) {
			return [];
		}
		return instance.timers.map(timer => timer.data);
	}

	async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<TimerSettings>>): Promise<void> {
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

		const maybeTimer = maybeInstance.timers.find(queue => {
			return queue.data.id === ev.payload.settings.action.id;
		});

		if (!maybeTimer) {
			return ev.action.showAlert();
		}

		await maybeTimer.update(ev.payload.settings.action.action);

		return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
	}

	async update(action: Omit<Action<ActionBaseSettings<QueueSettings>>, "manifestId">, manifestId: string, newSettings?: ActionBaseSettings<QueueSettings>): Promise<void> {
		await super.update(action, manifestId, newSettings);

		if (!newSettings) {
			return;
		}

		const maybeInstance = firebotService.instances.find(instance => {
			return instance.data.endpoint === newSettings.endpoint;
		});

		if (!maybeInstance) {
			return;
		}

		const maybeTimer = maybeInstance.timers.find(timer => {
			return timer.data.id === newSettings.action.id;
		});

		if (!maybeTimer) {
			return;
		}

		await action.setState(maybeTimer.data.active ? 0 : 1);
	}
}
