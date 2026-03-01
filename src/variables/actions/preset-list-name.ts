import { ReplaceVariableTrigger, Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "presetListName",
        description: "Returns the name of the preset list associated with this action",
        usage: "presetListName"
    },
    hide: async (trigger: ReplaceVariableTrigger) => trigger.actionId !== "gg.dennis.firebot.presetList",
    evaluator: async (trigger: ReplaceVariableTrigger<PresetListActionSettings>) => {
        if (!trigger.instance.connected) {
            return null;
        }

        const presetList = Object.values(trigger.instance.data.presetEffectLists || {}).find(c => c.id === trigger.settings?.action?.id);

        return presetList ? presetList.name : null;
    }
};

export default variable;