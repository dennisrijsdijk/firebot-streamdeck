import firebotManager from "../../firebot-manager";

const variable: Variable = {
    definition: {
        handle: "customRoleUserCount",
        description: "Returns the current user count of a specified custom role.",
        usage: "customRoleUserCount[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CustomRoleActionSettings>, customRoleName?: string) => {
        const instance = firebotManager.getInstance(trigger.settings.endpoint || "");
        if (!instance) {
            return null;
        }

        if (!customRoleName) {
            if (trigger.actionId !== "gg.dennis.firebot.customrole") {
                return null;
            }

            const customRole = instance.data.customRoles[trigger.settings.action?.id || ""];
            return customRole ? customRole.count : null;
        }
    }
}

export default variable;