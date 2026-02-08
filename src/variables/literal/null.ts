import { Variable } from "../../types/replace-variables";

const variable: Variable = {
    definition: {
        handle: "null",
        description: "Represents the null value.",
        usage: "null"
    },
    evaluator: async () => null
};

export default variable;