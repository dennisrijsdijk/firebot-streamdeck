import { Action, action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase, CachedAction } from "../actionBase";
import { ActionBaseSettings, TimerSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.TIMER) })
export class Timer extends ActionBase<TimerSettings> {

    @route(ROUTE.TIMER)
    getTimers(request?: MessageRequest<EndpointBody, ActionBaseSettings<TimerSettings>>) {
        return firebotService.getInstance(request.body.endpoint).timers.map(timer => timer.data);
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

        const instance = firebotService.getInstance(ev.payload.settings.endpoint);

        if (instance.isNull) {
            return ev.action.showAlert();
        }

        const maybeTimer = instance.timers.find((queue) => {
            return queue.data.id === ev.payload.settings.action.id;
        });

        if (!maybeTimer) {
            return ev.action.showAlert();
        }

        await maybeTimer.update(ev.payload.settings.action.action);

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }

    async update(action: Omit<Action<ActionBaseSettings<TimerSettings>>, "manifestId">, cachedAction: CachedAction<TimerSettings>): Promise<void> {
        await super.update(action, cachedAction);

        const instance = firebotService.getInstance(cachedAction.settings.endpoint);

        if (instance.isNull) {
            return;
        }

        const maybeTimer = instance.timers.find((timer) => {
            return timer.data.id === cachedAction.settings.action.id;
        });

        if (!maybeTimer) {
            return;
        }

        await action.setState(maybeTimer.data.active ? 0 : 1);
    }
}
