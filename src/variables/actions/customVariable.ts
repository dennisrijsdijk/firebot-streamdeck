import { ReplaceVariable, ReplaceVariableTrigger } from "../../types/replaceVariable";
import firebotService from '../../plugin/firebot-api/service';
import { ApiCustomVariableBody } from "../../types/api";
import { JsonValue } from "@elgato/streamdeck";

const model: ReplaceVariable = {
    handle: "customVariable",
    evaluator: async (trigger: ReplaceVariableTrigger<never>, name?: string, propertyPath?: string, defaultData?: JsonValue) => {
        if (!name) {
            return defaultData;
        }

        const endpoint = trigger.settings.endpoint;
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return null;
        }

        const variable: ApiCustomVariableBody | undefined = instance.customVariables[name];

        if (!variable) {
            return defaultData;
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
            for (let idx = 0; idx < pathNodes.length; idx++) {
                if (data == null) {
                    break;
                }
                let node: string | number = pathNodes[idx];
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
};

export default model;