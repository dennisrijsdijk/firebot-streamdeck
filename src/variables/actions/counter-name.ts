import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "counterName",
        description: "Returns the name of the counter associated with this action",
        usage: "counterName"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.counter",
    evaluator: async (trigger: ReplaceVariableTrigger<CounterActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const counter = Object.values(trigger.instance.data.counters || {}).find(c => c.id === trigger.settings?.action?.id);

        return counter ? counter.name : null;
    }
};

export default variable;