import evaluate from "./expressionish";
import variables from "../variables";
import { ReplaceVariable } from "../types/replaceVariable";

class ReplaceVariablesManager {
    private readonly _handlers: Map<string, ReplaceVariable>;

    constructor() {
        this._handlers = new Map<string, ReplaceVariable>();
        variables.forEach(variable => this.registerReplaceVariable(variable));
    }

    registerReplaceVariable(variable: ReplaceVariable): void {
        if (this._handlers.has(variable.handle)) {
            throw new TypeError(`A variable with the handle ${variable.handle} already exists.`);
        }
        this._handlers.set(variable.handle, variable);
    }

    async evaluate(expression: string, metadata: unknown): Promise<string> {
        try {
            return await evaluate({
                handlers: this._handlers,
                expression,
                metadata
            });
        } catch (err) {
            return expression;
        }
    }
}

export default new ReplaceVariablesManager();