import streamDeck from "@elgato/streamdeck";
import firebotManager from "../firebot-manager";
import { FirebotInstance } from "../types/firebot";
import { getCustomVariable, } from "../util";
import actionVariables from "./actions";
import literalVariables from "./literal";
import numberVariables from "./number";
import spoofedVariables from "./spoofed";
import { evaluate, LookupMap, VariableMap, VariableEvaluateFnc } from "expressionish";
import { ReplaceVariable, ReplaceVariableTrigger, VariableDefinition } from "../types/replace-variables";

const variables: ReplaceVariable[] = [
    ...actionVariables,
    ...literalVariables,
    ...numberVariables,
    ...spoofedVariables
];

streamDeck.ui.onSendToPlugin(async (ev) => {
    if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getVariables") {
        return;
    }

    let instance: FirebotInstance;
    
    const action = streamDeck.actions.getActionById(ev.action.id);
    const settings = await action?.getSettings<BaseActionSettings<{}>>();
    
    try {
        instance = firebotManager.getInstance(settings?.endpoint || "");
    } catch {
        streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings?.endpoint || ""}`);
        return;
    }

    const frontendVariables: VariableDefinition[] = await Promise.all(variables.map(async (variable) => {
        const definition = structuredClone(variable.definition);

        if (!definition.examples) {
            definition.examples = [];
        }

        if (!variable.getSuggestions) {
            return definition;
        }

        const settings = await ev.action.getSettings<BaseActionSettings<{}>>();

        definition.examples.push(...await variable.getSuggestions({ actionId: ev.action.manifestId, settings, instance }));

        return definition;
    }));

    return streamDeck.ui.sendToPropertyInspector({ event: "getVariables", variables: frontendVariables });
});

const lookups: LookupMap = new Map();

// @ts-expect-error
lookups.set("$", (_, name: string) => ({
    evaluate: (trigger: ReplaceVariableTrigger, ...args: unknown[]) => {
        return getCustomVariable(name, trigger.instance, args as string[]);
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