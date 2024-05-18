import actions from "./actions";
import literal from "./literal";
import lookups from "./lookups";
import numbers from "./numbers";

export const replaceVariables = [
    ...actions,
    ...literal,
    ...numbers
];

export const replaceVariableLookups = {
    ...lookups
};
