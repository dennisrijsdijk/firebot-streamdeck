import {ReplaceVariable} from "../../types/replaceVariable";

const model: ReplaceVariable = {
    handle: "false",
    usages: [
        {
            handle: "false",
            description: "Get a literal boolean false"
        }
    ],
    evaluator: async () => false
}

export default model;