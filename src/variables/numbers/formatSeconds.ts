import { ReplaceVariable } from "../../types/replaceVariable";

function stringify(num: number) {
    return num.toString().padStart(2, '0');
}

const model: ReplaceVariable = {
    handle: "formatSeconds",
    evaluator: async (_, rawSeconds: number | string, alwaysShowHours = false) => {
        if (!rawSeconds || isNaN(Number(rawSeconds))) {
            rawSeconds = 0;
        }

        const secondsNumber = Number(rawSeconds);

        const hours = Math.floor(secondsNumber / 3600);
        const minutes = Math.floor(secondsNumber / 60 % 60);
        const seconds = Math.floor(secondsNumber % 60);

        const output = `${stringify(hours)}:${stringify(minutes)}:${stringify(seconds)}`;

        let deleteAmount = 0;

        if (!alwaysShowHours && hours === 0) {
            deleteAmount = stringify(hours).length + 1;
        }

        return output.substring(deleteAmount);
    }
};

export default model;