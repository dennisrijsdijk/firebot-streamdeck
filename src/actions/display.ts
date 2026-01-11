import { action } from "@elgato/streamdeck";
import { BaseAction } from "../base-action";

@action({ UUID: "gg.dennis.firebot.display" })
export class DisplayAction extends BaseAction<{}> { }