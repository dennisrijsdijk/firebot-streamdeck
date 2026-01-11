import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";
import { getCustomVariable } from "../../util";

const variable: Variable = {
    definition: {
        handle: "customVariable",
        description: "Returns the current value of a specified custom variable.",
        usage: "customVariable[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<never>, variableName: string, propertyPath?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return null;
        }
        
        return getCustomVariable(variableName, instance, propertyPath);
    }
};

export default variable;