import { action, KeyDownEvent, MessageRequest, route } from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ActionBaseSettings, PresetEffectListSettings } from "../../types/settings";

import firebotService from "../firebot-api/service";
import { ACTION, fullActionId, ROUTE } from "../../constants";
import { EndpointBody } from "../../types/routing";

@action({ UUID: fullActionId(ACTION.PRESETLIST) })
export class PresetEffectList extends ActionBase<PresetEffectListSettings> {

    @route(ROUTE.PRESETLIST)
    async getPresetLists(request?: MessageRequest<EndpointBody, ActionBaseSettings<PresetEffectListSettings>>) {
        return Object.values((await firebotService.getInstance(request.body.endpoint).presetLists)).map(presetList => presetList.data);
    }

    async onKeyDown(ev: KeyDownEvent<ActionBaseSettings<PresetEffectListSettings>>): Promise<void> {
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

        const maybePresetList = instance.presetLists[ev.payload.settings.action.id];

        if (!maybePresetList) {
            return ev.action.showAlert();
        }

        await maybePresetList.run(ev.payload.settings.action.arguments ?? { });

        return this.update(ev.action, {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        });
    }
}
