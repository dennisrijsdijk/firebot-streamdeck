import { getCustomVariable } from "../../util";
import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "customVariable",
        description: "Returns the current value of a specified custom variable.",
        usage: "customVariable[name]",
        examples: [
            {
                usage: "customVariable[example]",
                description: "Returns the value of the custom variable named 'example'."
            },
            {
                usage: "customVariable[example, path.to.value]",
                description: "Returns the value of the custom variable named 'example' at property path 'path.to.value'."
            }
        ]
    },
    evaluator: async (trigger: ReplaceVariableTrigger<never>, variableName: string, propertyPath?: string) => {
        return getCustomVariable(variableName, trigger.instance, propertyPath);
    }
};

export default variable;