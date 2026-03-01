import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "commandTrigger",
        description: "Returns the trigger of the command associated with this action",
        usage: "commandTrigger"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.command",
    evaluator: async (trigger: ReplaceVariableTrigger<CommandActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const command = Object.values(trigger.instance.data.commands || {}).find(c => c.id === trigger.settings?.action?.id);

        return command ? command.trigger : null;
    }
};

export default variable;