import { VariableUsage } from "@dennisrijsdijk/node-firebot";
import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "queueLength",
        description: "Returns the amount of effect lists in a specified queue.",
        usage: "queueLength[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<QueueActionSettings>, queueName?: string) => {
        if (!trigger.instance.connected) {
            return null;
        }

        if (!queueName) {
            const queue = trigger.instance.data.queues[trigger.settings?.action?.id || ""];
            return queue ? queue.length : -1;
        }

        const queue = Object.values(trigger.instance.data.queues || {}).find(q => q.name.toLowerCase() === queueName.toLowerCase());
        return queue ? queue.length : -1;
    },
    getSuggestions: async (trigger: ReplaceVariableTrigger) => {
        const usages: VariableUsage[] = [];

        if (trigger.actionId === "gg.dennis.firebot.queue") {
            usages.push({
                usage: "queueLength",
                description: "Gets the length of the queue associated with this action."
            });
        }

        usages.push(...Object.values(trigger.instance.data.queues || {}).map(queue => ({
            usage: `queueLength[${queue.name}]`,
            description: `Gets the length of the queue named "${queue.name}".`
        })));
        return usages;
    }
};

export default variable;