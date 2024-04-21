import {ActionBaseSettings} from "./settings";

export type ReplaceVariableUsage = {
    // eg. counter
    // eg. counter[name]
    handle: string;
    description: string;
}

export type ReplaceVariable = {
    evaluator: (trigger: any, ...args: any[]) => Promise<any>;
    handle: string;
    usages: ReplaceVariableUsage[];
}

export type PiReplaceVariable = Omit<ReplaceVariable, "evaluator">;

export type ReplaceVariableTrigger<T> = {
    actionId: string;
    settings: ActionBaseSettings<T>;
}