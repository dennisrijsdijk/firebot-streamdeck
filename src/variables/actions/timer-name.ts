import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "timerName",
        description: "Returns the name of the timer associated with this action",
        usage: "timerName"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.timer",
    evaluator: async (trigger: ReplaceVariableTrigger<TimerActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const timer = Object.values(trigger.instance.data.timers || {}).find(c => c.id === trigger.settings?.action?.id);

        return timer ? timer.name : null;
    }
};

export default variable;