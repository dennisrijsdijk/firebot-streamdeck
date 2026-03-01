import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "customRoleName",
        description: "Returns the name of the custom role associated with this action",
        usage: "customRoleName"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.customRole",
    evaluator: async (trigger: ReplaceVariableTrigger<CustomRoleActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const customRole = Object.values(trigger.instance.data.customRoles || {}).find(c => c.id === trigger.settings?.action?.id);

        return customRole ? customRole.name : null;
    }
};

export default variable;