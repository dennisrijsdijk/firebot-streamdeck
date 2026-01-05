import { LookupMap, EvaluateOptions } from "expressionish";

export type VariableMap = EvaluateOptions["variables"];
export type ExpressionishVariable = ReturnType<VariableMap["get"]>;
export type LookupFnc = ReturnType<LookupMap["get"]>;
export type VariableEvaluateFnc = ExpressionishVariable["evaluate"];

export type VariableUsage = {
    usage: string;
    description?: string;
};

export interface VariableDefinition {
    handle: string;
    aliases?: string[];
    usage?: string;
    description: string;
    examples?: VariableUsage[];
    hidden?: boolean;
}

export type ReplaceVariableTrigger<TActionSettings = unknown> = {
    actionId: string;
    settings: BaseActionSettings<TActionSettings>;
};

export type Variable = {
    definition: VariableDefinition;
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator(trigger: ReplaceVariableTrigger, ...args: unknown[]): Promise<unknown>;
};

export type SpoofedVariable = {
    definition: VariableDefinition & { spoof: true };
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator?: never;
};

export type ReplaceVariable = Variable | SpoofedVariable;

export type RegisteredVariable = {
    definition: VariableDefinition;
    handle: string;
    triggers: TriggersObject;
    argsCheck: (...args: unknown[]) => void;
    evaluator(trigger: ReplaceVariableTrigger, ...args: unknown[]): Promise<unknown>;
    getSuggestions: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
};