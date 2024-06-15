import { Action, action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase, CachedAction } from "../actionBase";
import { ActionBaseSettings, QueueSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.QUEUE) })
export class Queue extends ActionBase<QueueSettings> {

    @route(ROUTE.QUEUE)
    getQueues(request?: MessageRequest<EndpointBody, ActionBaseSettings<QueueSettings>>) {
        return firebotService.getInstance(request.body.endpoint).queues.map(queue => queue.data);
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

        const instance = firebotService.getInstance(ev.payload.settings.endpoint);

        if (instance.isNull) {
            return ev.action.showAlert();
        }

        const maybeQueue = instance.queues.find((queue) => {
            return queue.data.id === ev.payload.settings.action.id;
        });

        if (!maybeQueue) {
            return ev.action.showAlert();
        }

        await maybeQueue.update(ev.payload.settings.action.action);

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }

    async update(action: Omit<Action<ActionBaseSettings<QueueSettings>>, "manifestId">, cachedAction: CachedAction<QueueSettings>): Promise<void> {
        await super.update(action, cachedAction);

        const instance = firebotService.getInstance(cachedAction.settings.endpoint);

        if (instance.isNull) {
            return;
        }

        const maybeQueue = instance.queues.find((queue) => {
            return queue.data.id === cachedAction.settings.action.id;
        });

        if (!maybeQueue) {
            return;
        }

        await action.setState(maybeQueue.active ? 0 : 1);
    }
}
