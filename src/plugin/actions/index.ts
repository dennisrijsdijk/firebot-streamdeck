import {Counter} from "./counter";
import {Display} from "./display";
import {Queue} from "./queue";
import {CustomRole} from "./customRole";
import {PresetEffectList} from "./presetEffectList";
import {Command} from "./command";
import {Timer} from "./timer";
import {CustomVariable} from "./customVariable";

export default [
    new Command(),
    new Counter(),
    new CustomRole(),
    new CustomVariable(),
    new Display(),
    new PresetEffectList(),
    new Queue(),
    new Timer()
];
