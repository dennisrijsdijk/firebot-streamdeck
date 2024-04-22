import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {QueueSettings} from "../../types/settings";
import FirebotQueue from "../../plugin/firebot-api/routes/queue";
import rawQueue from "./rawQueue";

const model: ReplaceVariable = {
    handle: "queueActive",
    usages: [
        {
            handle: "queueActive",
            description: "Returns $true when the attached queue is active, $false otherwise",
        },
        {
            handle: "queueActive[name]",
            description: "Returns $true when the specified queue is active, $false otherwise"
        }
    ],
    evaluator: async (trigger: ReplaceVariableTrigger<QueueSettings>, queueName?: string) => {
        const queue: FirebotQueue | undefined = await rawQueue.evaluator(trigger, queueName);
        if (!queue) {
            return null;
        }

        return queue.active;
    }
}

export default model;