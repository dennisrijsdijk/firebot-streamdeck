import {ReplaceVariable} from "../../types/replaceVariable";

const model: ReplaceVariable = {
    handle: "true",
    usages: [
        {
            handle: "true",
            description: "Get a literal boolean true"
        }
    ],
    evaluator: async () => true
}

export default model;