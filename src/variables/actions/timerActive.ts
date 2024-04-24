import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {TimerSettings} from "../../types/settings";
import firebotService from "../../plugin/firebot-api/service";
import FirebotTimer from "../../plugin/firebot-api/routes/timer";
import {ACTION, fullActionId} from "../../constants";

const model: ReplaceVariable = {
    handle: "timerActive",
    usages: [
        {
            handle: "timerActive",
            description: "Returns $true when the attached timer is active, $false otherwise",
        },
        {
            handle: "timerActive[name]",
            description: "Returns $true when the specified timer is active, $false otherwise"
        }
    ],
    evaluator: async (trigger: ReplaceVariableTrigger<TimerSettings>, timerName?: string) => {
        const endpoint = trigger.settings.endpoint;
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return null;
        }

        let timer: FirebotTimer | undefined;

        if (timerName) {
            timer = instance.timers.find(instanceQueue => instanceQueue.data.name === timerName);
        } else {
            if (trigger.actionId !== fullActionId(ACTION.TIMER)) {
                return null
            }

            timer = instance.timers.find(instanceQueue => instanceQueue.data.id === trigger.settings.action.id);
        }

        if (!timer) {
            return null;
        }

        return timer.data.active;
    }
}

export default model;