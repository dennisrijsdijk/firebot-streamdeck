import { SpoofedVariable } from "../../types/replace-variables";

const variable: SpoofedVariable = {
    definition: {
        handle: "NOT",
        description: "Returns the opposite of the condition's result. Only works within $if[]",
        usage: "NOT[condition]",
        examples: [
            {
                usage: 'NOT[a === a]',
                description: "Returns false as a equals a"
            }
        ]
    }
};

export default variable;