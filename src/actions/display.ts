import { action, WillAppearEvent } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "gg.dennis.firebot.display" })
export class DisplayAction extends BaseAction<{}> {
    override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<{}>>): Promise<void> {
        await super.onWillAppear(ev);

        await this.populateSettings(ev, {});
    }
}