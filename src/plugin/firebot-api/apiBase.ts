export default class ApiBase {
    protected get abortSignal() {
        return { signal: AbortSignal.timeout(2500) };
    }
}