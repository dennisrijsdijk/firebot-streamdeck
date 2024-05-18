// @ts-ignore
import evalVars from 'expressionish';
import { ReplaceVariable, ShorthandLookup } from "../types/replaceVariable";

export interface Options {
    handlers: Map<string, ReplaceVariable>;
    lookups?: Map<string, ShorthandLookup>;
    expression: string;
    metadata: unknown;
    trigger?: unknown;
}

export default async function evaluate(options: Options): Promise<string> {
    return evalVars(options);
}