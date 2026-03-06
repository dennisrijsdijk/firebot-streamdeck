import { Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "truncate",
        description: "Truncate a string to a specified length.",
        usage: "truncate[value, length, suffix = '...']",
        examples: [
            {
                usage: "truncate[Hello, World!, 5]",
                description: "Returns \"Hello...\"."
            },
            {
                usage: "truncate[Hello, World!, 5, \"\"]",
                description: "Returns \"Hello\"."
            },
            {
                usage: "truncate[abcd, 5]",
                description: "Returns \"abcd\"."
            }
        ]
    },
    evaluator: async (_, value: string, length: number, suffix: string = "...") => {
        if (value == null) {
            return "";
        }
        if (String(value).length <= length) {
            return value;
        }
        return String(value).substring(0, length) + suffix;
    }
};

export default variable;