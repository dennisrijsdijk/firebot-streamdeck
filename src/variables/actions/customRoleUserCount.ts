import {ReplaceVariable, ReplaceVariableTrigger} from "../../types/replaceVariable";
import {CustomRoleSettings} from "../../types/settings";
import firebotService from '../../plugin/firebot-api/service';
import {ACTION, fullActionId} from "../../constants";
import FirebotCustomRole from "../../plugin/firebot-api/routes/customRole";

const model: ReplaceVariable = {
    handle: "customRoleUserCount",
    evaluator: async (trigger: ReplaceVariableTrigger<CustomRoleSettings>, roleName?: string) => {
        const endpoint = trigger.settings.endpoint;
        const instance = firebotService.instances.find(inst => inst.data.endpoint === endpoint);
        if (!instance) {
            return null;
        }

        let role: FirebotCustomRole | undefined;

        if (roleName) {
            role = instance.customRoles.find(instanceRole => instanceRole.data.name === roleName);
        } else {
            if (trigger.actionId !== fullActionId(ACTION.CUSTOMROLE)) {
                return null
            }

            role = instance.customRoles.find(instanceRole => instanceRole.data.id === trigger.settings.action.id);
        }

        if (!role) {
            return null;
        }

        return role.length;
    }
}

export default model;