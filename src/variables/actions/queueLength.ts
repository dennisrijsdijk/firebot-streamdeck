import { ReplaceVariable, ReplaceVariableTrigger } from "../../types/replaceVariable";
import { QueueSettings } from "../../types/settings";
import { getQueue } from "./rawQueue";
import FirebotQueue from "../../plugin/firebot-api/routes/queue";

const model: ReplaceVariable = {
    handle: "queueLength",
    evaluator: async (trigger: ReplaceVariableTrigger<QueueSettings>, queueName?: string) => {
        const queue: FirebotQueue | undefined = await getQueue(trigger, queueName);
        if (!queue) {
            return null;
        }

        return queue.length;
    }
};

export default model;