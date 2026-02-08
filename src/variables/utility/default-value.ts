import { Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "defaultValue",
        description: "Return the default value if the provided value is null or an empty string. If the provided value is valid, it will be returned instead.",
        usage: "defaultValue[value, default, matchEmptyString = true]",
        examples: [
            {
                usage: "defaultValue[5]",
                description: "Returns 5."
            },
            {
                usage: "defaultValue[, 10]",
                description: "Returns 10 because the provided value is an empty string and matchEmptyString defaults to true."
            },
            {
                usage: "defaultValue[, 10, false]",
                description: "Returns an empty string because the provided value is an empty string but matchEmptyString is set to false."
            }
        ]
    },
    evaluator: async (_, value: string | number | null, defaultValue: string | number | boolean, matchEmptyString: boolean = true) => {
        if (value == null || (matchEmptyString && typeof value === "string" && value.trim() === "")) {
            return defaultValue;
        }
        return value;
    }
};

export default variable;