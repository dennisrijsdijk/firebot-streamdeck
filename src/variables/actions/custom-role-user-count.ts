import { ReplaceVariableTrigger, Variable, VariableUsage } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "customRoleUserCount",
        description: "Returns the current user count of a specified custom role.",
        usage: "customRoleUserCount[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<CustomRoleActionSettings>, customRoleName?: string) => {
        if (!customRoleName) {
            const customRole = trigger.instance.data.customRoles[trigger.settings?.action?.id || ""];
            return customRole ? customRole.count : null;
        }

        const customRole = Object.values(trigger.instance.data.customRoles || {}).find(c => c.name.toLowerCase() === customRoleName.toLowerCase());
        return customRole ? customRole.count : null;
    },
    getSuggestions: async (trigger: ReplaceVariableTrigger) => {
        const usages: VariableUsage[] = [];

        if (trigger.actionId === "gg.dennis.firebot.customrole") {
            usages.push({
                usage: "customRoleUserCount",
                description: "Gets the user count of the custom role associated with this action."
            });
        }

        usages.push(...Object.values(trigger.instance.data.customRoles || {}).map(customRole => ({
            usage: `customRoleUserCount[${customRole.name}]`,
            description: `Gets the user count of the custom role named "${customRole.name}".`
        })));
        return usages;
    }
};

export default variable;