import { SpoofedVariable } from "../../types/replace-variables";

const variable: SpoofedVariable = {
    definition: {
        handle: "NAND",
        description: "Returns true if any of the conditions return false. Only works within $if[]",
        usage: "NAND[condition, condition, ...]",
        examples: [
            {
                usage: 'NAND[a === a, b === c]',
                description: "Returns true as b does not equal c"
            }
        ]
    }
};

export default variable;