import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {QueueSettings} from "../../types/settings";
import rawQueue from "./rawQueue";
import FirebotQueue from "../../plugin/firebot-api/routes/queue";

const model: ReplaceVariable = {
    handle: "queue",
    usages: [
        {
            handle: "queue",
            description: "Displays the length of the queue attached to an update queue action",
        },
        {
            handle: "queue[name]",
            description: "Displays the length of the given queue."
        }
    ],
    evaluator: async (trigger: ReplaceVariableTrigger<QueueSettings>, queueName?: string) => {
        const queue: FirebotQueue | undefined = await rawQueue.evaluator(trigger, queueName);
        if (!queue) {
            return null;
        }

        return queue.length;
    }
}

export default model;