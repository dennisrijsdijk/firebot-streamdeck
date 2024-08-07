import { ReplaceVariable, ReplaceVariableTrigger } from "../../types/replaceVariable";
import { CounterSettings } from "../../types/settings";
import firebotService from '../../plugin/firebot-api/service';
import FirebotCounter from "../../plugin/firebot-api/routes/counter";
import { ACTION, fullActionId } from "../../constants";

const model: ReplaceVariable = {
    handle: "counter",
    evaluator: async (trigger: ReplaceVariableTrigger<CounterSettings>, counterName?: string) => {
        const instance = firebotService.getInstance(trigger.settings.endpoint);
        if (instance.isNull) {
            return null;
        }

        let counter: FirebotCounter | undefined;

        if (counterName) {
            counter = Object.values(instance.counters).find(instanceCounter => instanceCounter.data.name === counterName);
        } else {
            if (trigger.actionId !== fullActionId(ACTION.COUNTER)) {
                return null;
            }

            counter = instance.counters[trigger.settings.action.id];
        }

        if (!counter) {
            return null;
        }

        return counter.value;
    }
};

export default model;