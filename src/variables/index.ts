import actionVariables from "./actions";
import { evaluate, LookupMap } from "expressionish";
import { Variable, VariableMap, VariableEvaluateFnc, ReplaceVariableTrigger } from "../types/replace-variables";

const variables: Variable[] = [
    ...actionVariables
]

const lookups: LookupMap = new Map();

const variableMap: VariableMap = new Map();

for (const variable of variables) {
    variableMap.set(variable.definition.handle, {
        evaluate: variable.evaluator as VariableEvaluateFnc,
    });
}

export async function findAndReplaceVariables(expression: string, trigger: ReplaceVariableTrigger): Promise<unknown> {
    if (!expression || typeof expression !== "string" || !expression.includes("$")) {
        return expression;
    }
    return evaluate({ expression, data: trigger, lookups, variables: variableMap });
}