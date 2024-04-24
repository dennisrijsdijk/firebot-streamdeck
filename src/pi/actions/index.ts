import PiAction from "../piAction";
import {ACTION, PLUGIN} from "../../constants";
import PiCommand from "./command";
import PiCounter from "./counter";
import PiCustomRole from './customRole';
import PiDisplay from "./display";
import PiPresetEffectList from "./presetEffectList";
import PiQueue from "./queue";
import PiTimer from "./timer";

export function getAction(uuid: string): PiAction | undefined {
    const actionIdShort = uuid.substring(PLUGIN.length + 1) as ACTION;

    switch (actionIdShort) {
        case ACTION.COMMAND:
            return PiCommand;
        case ACTION.COUNTER:
            return PiCounter;
        case ACTION.CUSTOMROLE:
            return PiCustomRole;
        case ACTION.CUSTOMVARIABLE:
            break;
        case ACTION.DISPLAY:
            return PiDisplay;
        case ACTION.PRESETLIST:
            return PiPresetEffectList;
        case ACTION.QUEUE:
            return PiQueue
        case ACTION.TIMER:
            return PiTimer;
    }
    return undefined;
}