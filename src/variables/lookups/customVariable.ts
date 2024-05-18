import { getCustomVariable } from "../actions/customVariable";
import { ReplaceVariableTrigger } from "../../types/replaceVariable";

export default {
    '$': (name: string) => ({
        evaluator: (trigger: ReplaceVariableTrigger<unknown>, ...path: string[]) => {
            return getCustomVariable(trigger.settings.endpoint, name, path);
        }
    })
}