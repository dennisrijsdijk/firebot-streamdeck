import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";

const variable: Variable = {
    definition: {
        handle: "timerActive",
        description: "Returns true when a timer is active or false when paused.",
        usage: "timerActive[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<TimerActionSettings>, timerName?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return null;
        }

        if (!timerName) {
            const timer = instance.data.timers[trigger.settings?.action?.id || ""];
            return timer ? timer.active : false;
        }
        
        const timer = Object.values(instance.data.timers || {}).find(t => t.name.toLowerCase() === timerName.toLowerCase());
        return timer ? timer.active : false;
    },
    getSuggestions: async (trigger: ReplaceVariableTrigger) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return [];
        }

        const usages: VariableUsage[] = [];

        if (trigger.actionId === "gg.dennis.firebot.timer") {
            usages.push({
                usage: "timerActive",
                description: "Returns true if the timer associated with this action is active, or false if it is paused."
            });
        }

        usages.push(...Object.values(instance.data.timers || {}).map(timer => ({
            usage: `timerActive[${timer.name}]`,
            description: `Returns true if the timer named "${timer.name}" is active, or false if it is paused.`
        })));
        return usages;
    }
};

export default variable;