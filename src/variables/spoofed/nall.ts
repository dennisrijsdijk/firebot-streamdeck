import { SpoofedVariable } from "../../types/replace-variables";

const variable: SpoofedVariable = {
    definition: {
        handle: "NALL",
        description: "Returns true if any of the conditions return false. Only works within $if[]",
        usage: "NALL[condition, condition, ...]",
        examples: [
            {
                usage: 'NALL[a === a, b === c]',
                description: "Returns true as b does not equal c"
            }
        ]
    }
};

export default variable;