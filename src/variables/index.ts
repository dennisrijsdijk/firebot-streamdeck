import streamDeck from "@elgato/streamdeck";
import firebotManager from "../firebot-manager";
import { FirebotInstance } from "../types/firebot";
import { getCustomVariable, } from "../util";
import actionVariables from "./actions";
import literalVariables from "./literal";
import spoofedVariables from "./spoofed";
import utilityVariables from "./utility";
import { evaluate, LookupMap, VariableMap, VariableEvaluateFnc } from "expressionish";
import { ReplaceVariable, ReplaceVariableTrigger, VariableDefinition } from "../types/replace-variables";

const variables: ReplaceVariable[] = [
    ...actionVariables,
    ...literalVariables,
    ...spoofedVariables,
    ...utilityVariables
];

streamDeck.ui.onSendToPlugin(async (ev) => {
    if (!ev.payload || typeof ev.payload !== "object" || !("event" in ev.payload) || ev.payload.event !== "getVariables") {
        return;
    }

    let instance: FirebotInstance;
    
    const action = streamDeck.actions.getActionById(ev.action.id);
    const settings = await action?.getSettings<BaseActionSettings<{}>>() as BaseActionSettings<unknown>;
    
    try {
        instance = firebotManager.getInstance(settings?.endpoint || "");
    } catch {
        streamDeck.logger.error(`No Firebot instance found for endpoint: ${settings?.endpoint || ""}`);
        return;
    }

    const trigger = { actionId: ev.action.manifestId, settings, instance };

    const frontendVariables: VariableDefinition[] = [];

    for (const variable of variables) {
        if (variable.hide) {
            const hideResult = await variable.hide(trigger);
            if (hideResult) {
                continue;
            }
        }

        const definition = structuredClone(variable.definition);

        if (!definition.examples) {
            definition.examples = [];
        }

        if (variable.getSuggestions) {
            definition.examples.push(...await variable.getSuggestions(trigger));
        }

        frontendVariables.push(definition);
    }

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