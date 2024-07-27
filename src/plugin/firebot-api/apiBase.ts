export default class ApiBase {
    protected baseEndpoint: string | null;

    protected get abortSignal() {
        return { signal: AbortSignal.timeout(2500) };
    }

    constructor(endpoint: string | null) {
        if (endpoint == null || endpoint.startsWith("http://")) {
            this.baseEndpoint = endpoint;
        } else {
            this.baseEndpoint = `http://${endpoint}:7472/api/v1`;
        }
    }

    protected async objectFetch<Tin, Tout>(apiPath: string, transformer: (input: Tin) => [string, Tout]): Promise<Record<string, Tout>> {
        if (this.baseEndpoint == null) {
            return {};
        }

        const result = await fetch(`${this.baseEndpoint}/${apiPath}`, this.abortSignal);
        const inputs = await result.json() as Tin[];
        const outputs: Record<string, Tout> = {};
        if (!Array.isArray(inputs)) {
            return {};
        }
        for (const input of inputs) {
            const [key, value] = transformer(input);
            outputs[key] = value;
        }
        return outputs;
    }
}