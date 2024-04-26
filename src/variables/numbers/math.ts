import { evaluate } from 'mathjs';
import {ReplaceVariable} from "../../types/replaceVariable";

const model: ReplaceVariable = {
    handle: "math",
    usages: [
    ],
    evaluator: async (_, expression: string) => {
        if (!expression || expression.length === 0) {
            return null;
        }

        try {
            return evaluate(expression);
        } catch (err) {
            return null;
        }
    }
}

export default model;