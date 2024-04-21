// @ts-ignore
import evalVars from 'expressionish';
import {ReplaceVariable} from "../types/replaceVariable";

export interface Options {
    handlers: Map<string, ReplaceVariable>;
    expression: string;
    metadata: unknown;
    trigger?: any;
    // TODO: Determine if shorthands would be benefitial
    //lookups?: Map;
}

export default async function evaluate(options: Options): Promise<string> {
    return evalVars(options);
}