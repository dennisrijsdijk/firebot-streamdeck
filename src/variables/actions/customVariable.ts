import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import firebotService from '../../plugin/firebot-api/service';
import {ApiCustomVariableBody} from "../../types/api";
import {JsonValue} from "@elgato/streamdeck";

const model: ReplaceVariable = {
    handle: "customVariable",
    usages: [
        {
            handle: "customVariable[name]",
            description: "Displays the value of the given custom variable."
        }
    ],
    evaluator: async (trigger: ReplaceVariableTrigger<never>, name?: string, propertyPath?: string, defaultData?: JsonValue) => {
        const endpoint = trigger.settings.endpoint;
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return null;
        }

        let variable: ApiCustomVariableBody | undefined;

        if (!name) {
            return null;
        }

        variable = instance.customVariables[name];

        if (!variable) {
            return null;
        }

        let data = structuredClone(variable.v);

        if (!data) {
            return defaultData;
        }

        if (!propertyPath || propertyPath === '') {
            return data;
        }

        try {
            if (typeof data === "string") {
                data = JSON.parse(data as string);
            }
            const pathNodes = `${propertyPath}`.split(".");
            for (let i = 0; i < pathNodes.length; i++) {
                if (data == null) {
                    break;
                }
                let node: string | number = pathNodes[i];
                // parse to int for array access
                if (Array.isArray(data)) {
                    if (isNaN(Number(node))) {
                        break;
                    }
                    node = parseInt(node);
                    data = data[node];
                } else {
                    data = (data as Record<string, JsonValue>)[node];
                }
            }
            return data != null ? data : defaultData;
        } catch (error) {
            return defaultData;
        }
    }
}

export default model;