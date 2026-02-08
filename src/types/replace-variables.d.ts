import { FirebotInstance } from "./firebot";

export type VariableUsage = {
    usage: string;
    description?: string;
};

export type VariableDefinition = {
    handle: string;
    usage?: string;
    description: string;
    examples?: VariableUsage[];
}

export type ReplaceVariableTrigger<TActionSettings = unknown> = {
    /** The Manifest ID of the action */
    actionId: string;
    settings: BaseActionSettings<TActionSettings>;
    instance: FirebotInstance;
};

export type Variable = {
    definition: VariableDefinition;
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator(trigger: ReplaceVariableTrigger, ...args: unknown[]): Promise<unknown>;
};

export type SpoofedVariable = {
    definition: VariableDefinition;
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator?: never;
};

export type ReplaceVariable = Variable | SpoofedVariable;