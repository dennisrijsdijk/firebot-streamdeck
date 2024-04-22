import PiAction from "../piAction";
import {ACTION, PLUGIN} from "../../constants";
import PiCounter from "./counter";
import PiCustomRole from './customRole';
import PiDisplay from "./display";
import PiQueue from "./queue";

export function getAction(uuid: string): PiAction | undefined {
    const actionIdShort = uuid.substring(PLUGIN.length + 1) as ACTION;

    switch (actionIdShort) {
        case ACTION.COMMAND:
            break;
        case ACTION.COUNTER:
            return PiCounter;
        case ACTION.CUSTOMROLE:
            return PiCustomRole;
        case ACTION.CUSTOMVARIABLE:
            break;
        case ACTION.DISPLAY:
            return PiDisplay;
        case ACTION.PRESETLIST:
            break;
        case ACTION.QUEUE:
            return PiQueue
        case ACTION.TIMER:
            break;
    }
    return undefined;
}