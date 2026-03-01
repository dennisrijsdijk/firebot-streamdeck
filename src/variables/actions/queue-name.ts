import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "queueName",
        description: "Returns the name of the effect queue associated with this action",
        usage: "queueName"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.effectQueue",
    evaluator: async (trigger: ReplaceVariableTrigger<QueueActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const effectQueue = Object.values(trigger.instance.data.queues || {}).find(c => c.id === trigger.settings?.action?.id);

        return effectQueue ? effectQueue.name : null;
    }
};

export default variable;