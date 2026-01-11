import firebotManager from "../../firebot-manager";

const variable: Variable = {
    definition: {
        handle: "queueLength",
        description: "Returns the amount of effect lists in a specified queue.",
        usage: "queueLength[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<QueueActionSettings>, queueName?: string) => {
        const instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        if (!instance) {
            return -1;
        }

        if (!queueName) {
            const queue = instance.data.queues[trigger.settings?.action?.id || ""];
            return queue ? queue.length : -1;
        }

        const queue = Object.values(instance.data.queues || {}).find(q => q.name.toLowerCase() === queueName.toLowerCase());
        return queue ? queue.length : -1;
    }
};

export default variable;