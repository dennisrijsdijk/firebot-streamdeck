import { ActionBaseSettings } from "./settings";

export type ReplaceVariableTrigger<T> = {
    actionId: string;
    settings: ActionBaseSettings<T>;
}

export type ReplaceVariable = {
    evaluator: (trigger: ReplaceVariableTrigger<unknown>, ...args: unknown[]) => Promise<unknown>;
    handle: string;
}