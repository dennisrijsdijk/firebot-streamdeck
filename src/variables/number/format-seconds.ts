import { Variable } from "../../types/replace-variables";

function stringify(num: number) {
    return num.toString().padStart(2, '0');
}

const variable: Variable = {
    definition: {
        handle: "formatSeconds",
        description: "Formats a number of seconds into a human-readable time format (HH:MM:SS or MM:SS).",
        usage: "formatSeconds[seconds, alwaysShowHours = false]",
        examples: [
            {
                usage: "formatSeconds[3661]",
                description: "Returns 01:01:01."
            },
            {
                usage: "formatSeconds[61]",
                description: "Returns 01:01."
            },
            {
                usage: "formatSeconds[661, true]",
                description: "Returns 00:11:01."
            }
        ]
    },
    evaluator: async (_, rawSeconds: string | number, alwaysShowHours: string | boolean = false) => {
        if (!rawSeconds || isNaN(Number(rawSeconds))) {
            rawSeconds = 0;
        }

        const secondsNumber = Number(rawSeconds);

        const hours = Math.floor(secondsNumber / 3600);
        const minutes = Math.floor(secondsNumber / 60 % 60);
        const seconds = Math.floor(secondsNumber % 60);

        const output = `${stringify(hours)}:${stringify(minutes)}:${stringify(seconds)}`;

        let deleteAmount = 0;

        if (alwaysShowHours !== true && alwaysShowHours !== "true" && hours === 0) {
            deleteAmount = stringify(hours).length + 1;
        }

        return output.substring(deleteAmount);
    }
};

export default variable;