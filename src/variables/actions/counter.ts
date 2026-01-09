import firebotManager from "../../firebot-manager";

const variable: Variable = {
    definition: {
        handle: "counter",
        description: "Returns the current value of a specified counter.",
        usage: "counter[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CounterActionSettings>, counterName?: string) => {
        const instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        if (!instance) {
            return null;
        }

        if (!counterName) {
            const counter = instance.data.counters[trigger.settings?.action?.id || ""];
            return counter ? counter.value : null;
        }

        if (typeof counterName !== "string" || trigger.actionId !== "gg.dennis.firebot.counter") {
            return null;
        }

        const counter = Object.values(instance.data.counters || {}).find(c => c.name.toLowerCase() === counterName.toLowerCase());
        return counter ? counter.value : null;
    }
};

export default variable;