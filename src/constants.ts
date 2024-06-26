export const PLUGIN = "gg.dennis.firebot";

export enum ACTION {
    COMMAND = "command",
    COUNTER = "counter",
    CUSTOMROLE = "customrole",
    CUSTOMVARIABLE = "customvariable",
    DISPLAY = "display",
    PRESETLIST = "presetlist",
    QUEUE = "queue",
    TIMER = "timer"
}

export function fullActionId(action: ACTION) {
    return `${PLUGIN}.${action}`;
}

export enum ROUTE {
    COMMAND = "/command",
    COUNTER = "/counter",
    CUSTOMROLE = "/customrole",
    PRESETLIST = "/presetlist",
    QUEUE = "/queue",
    TIMER = "/timer",
    REPLACEVARIABLES = "/replacevariables"
}
