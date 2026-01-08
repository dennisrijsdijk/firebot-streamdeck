type VariableUsage = {
    usage: string;
    description?: string;
};

interface VariableDefinition {
    handle: string;
    aliases?: string[];
    usage?: string;
    description: string;
    examples?: VariableUsage[];
}

type ReplaceVariableTrigger<TActionSettings = unknown> = {
    actionId: string;
    settings: BaseActionSettings<TActionSettings>;
};

type Variable = {
    definition: VariableDefinition;
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator(trigger: ReplaceVariableTrigger, ...args: unknown[]): Promise<unknown>;
};

type SpoofedVariable = {
    definition: VariableDefinition & { spoof: true };
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
    evaluator?: never;
};

type ReplaceVariable = Variable | SpoofedVariable;

type RegisteredVariable = {
    definition: VariableDefinition;
    handle: string;
    getSuggestions?: (trigger: ReplaceVariableTrigger) => Promise<VariableUsage[]>;
};