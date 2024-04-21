import PiAction from "../piAction";
import {ACTION, PLUGIN} from "../../constants";
import PiCounter from "./counter";
import PiDisplay from "./display";

export function getAction(uuid: string): PiAction | undefined {
    const actionIdShort = uuid.substring(PLUGIN.length + 1) as ACTION;

    switch (actionIdShort) {
        case ACTION.COMMAND:
            break;
        case ACTION.COUNTER:
            return PiCounter;
        case ACTION.CUSTOMROLE:
            break;
        case ACTION.CUSTOMVARIABLE:
            break;
        case ACTION.DISPLAY:
            return PiDisplay;
        case ACTION.PRESETLIST:
            break;
        case ACTION.QUEUE:
            break;
        case ACTION.TIMER:
            break;
    }
    return undefined;
}