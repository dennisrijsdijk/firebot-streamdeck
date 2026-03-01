import { ReplaceVariableTrigger, Variable, VariableUsage } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "counter",
        description: "Returns the current value of a specified counter.",
        usage: "counter[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CounterActionSettings>, counterName?: string) => {
        if (!trigger.instance.connected) {
            return null;
        }
        
        if (!counterName) {
            const counter = trigger.instance.data.counters[trigger.settings?.action?.id || ""];
            return counter ? counter.value : null;
        }

        const counter = Object.values(trigger.instance.data.counters || {}).find(c => c.name.toLowerCase() === counterName.toLowerCase());
        return counter ? counter.value : null;
    },
    getSuggestions: async (trigger: ReplaceVariableTrigger) => {
        const usages: VariableUsage[] = [];

        if (trigger.actionId === "gg.dennis.firebot.counter") {
            usages.push({
                usage: "counter",
                description: "Gets the value of the counter associated with this action."
            });
        }

        usages.push(...Object.values(trigger.instance.data.counters || {}).map(counter => ({
            usage: `counter[${counter.name}]`,
            description: `Gets the value of the counter named "${counter.name}".`
        })));

        return usages;
    }
};

export default variable;