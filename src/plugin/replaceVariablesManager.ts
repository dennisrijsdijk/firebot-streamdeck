import evaluate from "./expressionish";
import { replaceVariables, replaceVariableLookups } from "../variables";
import { ReplaceVariable, ShorthandLookup } from "../types/replaceVariable";

class ReplaceVariablesManager {
    private readonly _handlers: Map<string, ReplaceVariable>;
    private readonly _lookups: Map<string, ShorthandLookup>

    constructor() {
        this._handlers = new Map<string, ReplaceVariable>();
        this._lookups = new Map<string, ShorthandLookup>();
        replaceVariables.forEach(variable => this.registerReplaceVariable(variable));
        Object.keys(replaceVariableLookups).forEach((key) => {
            this.registerShorthandLookup(key, replaceVariableLookups[key]);
        });
    }

    registerReplaceVariable(variable: ReplaceVariable): void {
        if (this._handlers.has(variable.handle)) {
            throw new TypeError(`A variable with the handle ${variable.handle} already exists.`);
        }
        this._handlers.set(variable.handle, variable);
    }

    registerShorthandLookup(key: string, shorthand: ShorthandLookup): void {
        if (this._lookups.has(key)) {
            throw new TypeError(`A shorthand with the handle ${key} already exists.`);
        }
        this._lookups.set(key, shorthand);
    }

    async evaluate(expression: string, metadata: unknown): Promise<string> {
        try {
            return await evaluate({
                handlers: this._handlers,
                lookups: this._lookups,
                expression,
                metadata
            });
        } catch (err) {
            return expression;
        }
    }
}

export default new ReplaceVariablesManager();