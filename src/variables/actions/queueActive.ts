import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {QueueSettings} from "../../types/settings";
import FirebotQueue from "../../plugin/firebot-api/routes/queue";
import rawQueue from "./rawQueue";

const model: ReplaceVariable = {
    handle: "queueActive",
    evaluator: async (trigger: ReplaceVariableTrigger<QueueSettings>, queueName?: string) => {
        const queue: FirebotQueue | undefined = await rawQueue.evaluator(trigger, queueName);
        if (!queue) {
            return null;
        }

        return queue.active;
    }
}

export default model;