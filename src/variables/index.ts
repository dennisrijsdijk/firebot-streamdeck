import firebotManager from "../firebot-manager";
import { getCustomVariable, } from "../util";
import actionVariables from "./actions";
import literalVariables from "./literal";
import numberVariables from "./number";
import { evaluate, LookupMap, VariableMap, VariableEvaluateFnc } from "expressionish";

const variables: Variable[] = [
    ...actionVariables,
    ...literalVariables,
    ...numberVariables
]

const lookups: LookupMap = new Map();

lookups.set("$", (_, name: string) => ({
    evaluate: (trigger: ReplaceVariableTrigger, ...args: unknown[]) => {
        const instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        return getCustomVariable(name, instance, args as string[]);
    }
}));

const variableMap: VariableMap = new Map();

for (const variable of variables) {
    if (!variable.evaluator) {
        continue;
    }
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