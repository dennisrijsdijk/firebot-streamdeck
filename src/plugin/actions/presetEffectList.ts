import {action, KeyDownEvent, MessageRequest, MessageResponder, route,} from "@elgato/streamdeck";
import {ActionBase} from "../actionBase";
import {ActionBaseSettings, PresetEffectListSettings} from "../../types/settings";

import firebotService from "../firebot-api/service";
import {ACTION, fullActionId, ROUTE} from "../../constants";
import {EndpointBody} from "../../types/routing";

@action({ UUID: fullActionId(ACTION.PRESETLIST) })
export class PresetEffectList extends ActionBase<PresetEffectListSettings> {

    @route(ROUTE.PRESETLIST)
    getQueues(request?: MessageRequest<EndpointBody, ActionBaseSettings<PresetEffectListSettings>>, responder?: MessageResponder) {
        let endpoint = request?.body?.endpoint;
        if (endpoint == null) {
            endpoint = "127.0.0.1";
        }
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return [];
        }
        return instance.presetEffectLists.map(presetList => presetList.data);
    }

    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<PresetEffectListSettings>>): Promise<void> {
        if (
            ev.payload.settings.endpoint == null ||
            ev.payload.settings.action == null ||
            ev.payload.settings.action.id == null
        ) {
            return ev.action.showAlert();
        }

        const maybeInstance = firebotService.instances.find(instance => {
            return instance.data.endpoint === ev.payload.settings.endpoint;
        });

        if (!maybeInstance) {
            return ev.action.showAlert();
        }

        const maybePresetList = maybeInstance.presetEffectLists.find(presetList => {
            return presetList.data.id === ev.payload.settings.action.id;
        });

        if (!maybePresetList) {
            return ev.action.showAlert();
        }

        await maybePresetList.run(ev.payload.settings.action.arguments ?? { });

        return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
    }
}
