import {ReplaceVariable} from "../../types/replaceVariable";
import {randomInt} from "node:crypto";

const model: ReplaceVariable = {
    handle: "randomNumber",
    usages: [
        {
            handle: "randomNumber[max]",
            description: "Get a random number between 0 and the given maximum"
        },
        {
            handle: "randomNumber[min, max]",
            description: "Get a random number between the given range."
        }
    ],
    evaluator: async (_, minOrMaxRaw: number | string, alwaysMaxRaw?: number | string) => {
        let min: number;
        let max: number;
        
        if (alwaysMaxRaw == null) {
            min = 0;
            max = parseInt(minOrMaxRaw as string, 10);
        } else {
            min = parseInt(minOrMaxRaw as string, 10);
            max = parseInt(alwaysMaxRaw as string, 10);
        }

        if (isNaN(min) || isNaN(max)) {
            throw new Error();
        }

        return randomInt(min, max);
    }
}

export default model;