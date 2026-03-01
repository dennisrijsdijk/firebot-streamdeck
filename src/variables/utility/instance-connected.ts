import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "instanceConnected",
        description: "Returns true if the Firebot instance is connected, or false if it is disconnected.",
        usage: "instanceConnected",
    },
    evaluator: async (trigger: ReplaceVariableTrigger<never>) => {
        return trigger.instance.connected;
    }
};

export default variable;