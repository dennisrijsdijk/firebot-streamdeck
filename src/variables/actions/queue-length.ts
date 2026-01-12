import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";

const variable: Variable = {
    definition: {
        handle: "queueLength",
        description: "Returns the amount of effect lists in a specified queue.",
        usage: "queueLength[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<QueueActionSettings>, queueName?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return -1;
        }

        if (!queueName) {
            const queue = instance.data.queues[trigger.settings?.action?.id || ""];
            return queue ? queue.length : -1;
        }

        const queue = Object.values(instance.data.queues || {}).find(q => q.name.toLowerCase() === queueName.toLowerCase());
        return queue ? queue.length : -1;
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

        if (trigger.actionId === "gg.dennis.firebot.queue") {
            usages.push({
                usage: "queueLength",
                description: "Gets the length of the queue associated with this action."
            });
        }

        usages.push(...Object.values(instance.data.queues || {}).map(queue => ({
            usage: `queueLength[${queue.name}]`,
            description: `Gets the length of the queue named "${queue.name}".`
        })));
        return usages;
    }
};

export default variable;