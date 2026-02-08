import { Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "ensureNumber",
        description: "Ensure the provided value is a number. If it cannot be converted to a number, it will use a default value instead.",
        usage: "ensureNumber[value, default]",
        examples: [
            {
                usage: "ensureNumber[5]",
                description: "Returns 5."
            },
            {
                usage: "ensureNumber[abc, 10]",
                description: "Returns 10 because 'abc' cannot be converted to a number."
            },
            {
                usage: "ensureNumber[abc, def]",
                description: "Returns 0 because neither 'abc' nor 'def' can be converted to a number."
            }
        ]
    },
    evaluator: async (_, value: string | number, defaultValue?: number) => {
        const num = typeof value === "number" ? value : Number(value);
        if (!isNaN(num)) {
            return num;
        }
        const defaultNum = typeof defaultValue === "number" ? defaultValue : Number(defaultValue);
        return !isNaN(defaultNum) ? defaultNum : 0;
    }
};

export default variable;