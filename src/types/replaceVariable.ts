import {ActionBaseSettings} from "./settings";

export type ReplaceVariable = {
    evaluator: (trigger: any, ...args: any[]) => Promise<any>;
    handle: string;
}

export type ReplaceVariableTrigger<T> = {
    actionId: string;
    settings: ActionBaseSettings<T>;
}