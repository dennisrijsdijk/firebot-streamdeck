import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {QueueSettings} from "../../types/settings";
import firebotService from '../../plugin/firebot-api/service';
import FirebotQueue from "../../plugin/firebot-api/routes/queue";
import {ACTION, fullActionId} from "../../constants";

const model: ReplaceVariable = {
    handle: "rawQueue",
    evaluator: async (trigger: ReplaceVariableTrigger<QueueSettings>, queueName?: string) => {
        const endpoint = trigger.settings.endpoint;
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return null;
        }

        let queue: FirebotQueue | undefined;

        if (queueName) {
            queue = instance.queues.find(instanceQueue => instanceQueue.data.name === queueName);
        } else {
            if (trigger.actionId !== fullActionId(ACTION.QUEUE)) {
                return null
            }

            queue = instance.queues.find(instanceQueue => instanceQueue.data.id === trigger.settings.action.id);
        }

        if (!queue) {
            return null;
        }

        return queue;
    }
}

export default model;