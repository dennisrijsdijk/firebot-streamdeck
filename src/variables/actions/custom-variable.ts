import firebotManager from "../../firebot-manager";
import { getCustomVariable } from "../../util";

const variable: Variable = {
    definition: {
        handle: "customVariable",
        description: "Returns the current value of a specified custom variable.",
        usage: "customVariable[name]"
    },
    evaluator: async (trigger: ReplaceVariableTrigger<never>, variableName: string, propertyPath?: string) => {
        const instance = firebotManager.getInstance(trigger.settings?.endpoint || "");
        return getCustomVariable(variableName, instance, propertyPath);
    }
};

export default variable;