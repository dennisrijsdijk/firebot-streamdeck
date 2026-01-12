import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";

const variable: Variable = {
    definition: {
        handle: "queueActive",
        description: "Returns true when a queue is active or false when paused.",
        usage: "queueActive[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<QueueActionSettings>, queueName?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return null;
        }

        if (!queueName) {
            const queue = instance.data.queues[trigger.settings?.action?.id || ""];
            return queue ? queue.active : false;
        }

        const queue = Object.values(instance.data.queues || {}).find(q => q.name.toLowerCase() === queueName.toLowerCase());
        return queue ? queue.active : false;
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
                usage: "queueActive",
                description: "Returns true if the queue associated with this action is active, or false if it is paused."
            });
        }

        usages.push(...Object.values(instance.data.queues || {}).map(queue => ({
            usage: `queueActive[${queue.name}]`,
            description: `Returns true if the queue named "${queue.name}" is active, or false if it is paused.`
        })));
        return usages;
    }
};

export default variable;