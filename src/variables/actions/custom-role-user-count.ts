import streamDeck from "@elgato/streamdeck";
import firebotManager from "../../firebot-manager";
import { FirebotInstance } from "../../types/firebot";

const variable: Variable = {
    definition: {
        handle: "customRoleUserCount",
        description: "Returns the current user count of a specified custom role.",
        usage: "customRoleUserCount[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CustomRoleActionSettings>, customRoleName?: string) => {
        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        } catch {
            streamDeck.logger.error(`No Firebot instance found for endpoint: ${trigger.settings?.endpoint || ""}`);
            return null;
        }

        if (!customRoleName) {
            const customRole = instance.data.customRoles[trigger.settings?.action?.id || ""];
            return customRole ? customRole.count : null;
        }

        const customRole = Object.values(instance.data.customRoles || {}).find(c => c.name.toLowerCase() === customRoleName.toLowerCase());
        return customRole ? customRole.count : null;
    }
}

export default variable;