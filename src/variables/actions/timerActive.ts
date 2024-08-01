import { ReplaceVariable, ReplaceVariableTrigger } from "../../types/replaceVariable";
import { TimerSettings } from "../../types/settings";
import firebotService from "../../plugin/firebot-api/service";
import FirebotTimer from "../../plugin/firebot-api/routes/timer";
import { ACTION, fullActionId } from "../../constants";

const model: ReplaceVariable = {
    handle: "timerActive",
    evaluator: async (trigger: ReplaceVariableTrigger<TimerSettings>, timerName?: string) => {
        const instance = firebotService.getInstance(trigger.settings.endpoint);
        if (instance.isNull) {
            return null;
        }

        let timer: FirebotTimer | undefined;

        if (timerName) {
            timer = Object.values(instance.timers).find(instanceTimer => instanceTimer.data.name === timerName);
        } else {
            if (trigger.actionId !== fullActionId(ACTION.TIMER)) {
                return null;
            }

            timer = instance.timers[trigger.settings.action.id];
        }

        if (!timer) {
            return null;
        }

        return timer.data.active;
    }
};

export default model;