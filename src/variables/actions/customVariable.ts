import { ReplaceVariable, ReplaceVariableTrigger } from "../../types/replaceVariable";
import firebotService from '../../plugin/firebot-api/service';
import { JsonValue } from "@elgato/streamdeck";

export function getCustomVariable(endpoint: string, name: string, propertyPath: string[]) {
    if (!name) {
        return null;
    }

    const instance = firebotService.getInstance(endpoint);
    if (instance.isNull) {
        return null;
    }

    const variable: JsonValue | undefined = instance.customVariables[name];

    if (!variable) {
        return null;
    }

    let data = structuredClone(variable);

    if (!data) {
        return null;
    }

    if (propertyPath.length === 0) {
        return data;
    }

    try {
        if (typeof data === "string") {
            try {
                data = JSON.parse(data as string);
            } catch (_) { }
        }

        for (const item of propertyPath) {
            if (data == null) {
                return null;
            }
            data = data[item];
        }
        return data ?? null;
    } catch (error) {
        return null;
    }
}

const model: ReplaceVariable = {
    handle: "customVariable",
    evaluator: async (trigger: ReplaceVariableTrigger<never>, name?: string, propertyPath?: string, defaultData?: JsonValue) => {
        let nodes: string[] = [];
        if (propertyPath != null) {
            nodes = propertyPath.split(/(?<!\\)\./gm);
            nodes.forEach(node => node.replace("\\.", "."));
        }
        return getCustomVariable(trigger.settings.endpoint, name, nodes) ?? defaultData;
    }
};

export default model;