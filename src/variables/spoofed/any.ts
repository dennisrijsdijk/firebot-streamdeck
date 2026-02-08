import { SpoofedVariable } from "../../types/replace-variables";

const variable: SpoofedVariable = {
    definition: {
        handle: "ANY",
        description: "Returns true if any of the conditions are true. Only works within $if[]",
        usage: "ANY[condition, condition, ...]",
        examples: [
            {
                usage: 'ANY[a === b, c === c]',
                description: "Returns true as c equals c"
            }
        ]
    }
};

export default variable;