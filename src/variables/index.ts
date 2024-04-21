import actions from "./actions";
import numbers from "./numbers";
import spoofed from "./spoofed";
import literal from "./literal";

export default [
    ...actions,
    ...literal,
    ...numbers,
    ...spoofed
];