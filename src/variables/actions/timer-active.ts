import firebotManager from "../../firebot-manager";

const variable: Variable = {
    definition: {
        handle: "timerActive",
        description: "Returns true when a timer is active or false when paused.",
        usage: "timerActive[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<TimerActionSettings>, timerName?: string) => {
        const instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        if (!instance) {
            return false;
        }

        if (!timerName) {
            const timer = instance.data.timers[trigger.settings?.action?.id || ""];
            return timer ? timer.active : false;
        }
        
        const timer = Object.values(instance.data.timers || {}).find(t => t.name.toLowerCase() === timerName.toLowerCase());
        return timer ? timer.active : false;
    }
};

export default variable;