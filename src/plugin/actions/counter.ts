import { action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ActionBaseSettings, CounterSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.COUNTER) })
export class Counter extends ActionBase<CounterSettings> {

    @route(ROUTE.COUNTER)
    getCounters(request?: MessageRequest<EndpointBody, ActionBaseSettings<CounterSettings>>) {
        return Object.values(firebotService.getInstance(request.body.endpoint).counters).map(counter => counter.data);
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

        const instance = firebotService.getInstance(ev.payload.settings.endpoint);

        if (instance.isNull) {
            return ev.action.showAlert();
        }

        const maybeCounter = instance.counters[ev.payload.settings.action.id];

        if (!maybeCounter) {
            return ev.action.showAlert();
        }

        await maybeCounter.updateByMode(ev.payload.settings.action.value, ev.payload.settings.action.action === "set");

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }
}
