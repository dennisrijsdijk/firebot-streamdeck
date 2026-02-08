import { evaluate } from "mathjs";
import { Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "math",
        description: "Calculates a mathematical expression.",
        usage: "math[expression]",
        examples: [
            {
                usage: "math[5 + 3 * 2]",
                description: "Returns 11."
            },
            {
                usage: "math[$counter[test] * 2]",
                description: "Returns double the value of the 'test' counter's value."
            }
        ]
    },
    evaluator: async (_, expression: unknown) => {
        return evaluate(`${expression}`);
    }
};

export default variable;