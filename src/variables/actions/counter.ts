import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";

const variable: Variable = {
    definition: {
        handle: "counter",
        description: "Returns the current value of a specified counter.",
        usage: "counter[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CounterActionSettings>, counterName?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return null;
        }

        if (!counterName) {
            const counter = instance.data.counters[trigger.settings?.action?.id || ""];
            return counter ? counter.value : null;
        }

        const counter = Object.values(instance.data.counters || {}).find(c => c.name.toLowerCase() === counterName.toLowerCase());
        return counter ? counter.value : null;
    },
    getSuggestions: async (trigger: ReplaceVariableTrigger) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return [];
        }

        const usages: VariableUsage[] = [];

        if (trigger.actionId === "gg.dennis.firebot.counter") {
            usages.push({
                usage: "counter",
                description: "Gets the value of the counter associated with this action."
            });
        }

        usages.push(...Object.values(instance.data.counters || {}).map(counter => ({
            usage: `counter[${counter.name}]`,
            description: `Gets the value of the counter named "${counter.name}".`
        })));

        return usages;
    }
};

export default variable;