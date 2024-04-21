import { action } from "@elgato/streamdeck";
import { ActionBase } from "../actionBase";
import { ACTION, fullActionId } from "../../constants";

@action({ UUID: fullActionId(ACTION.DISPLAY) })
export class Display extends ActionBase<never> { }
