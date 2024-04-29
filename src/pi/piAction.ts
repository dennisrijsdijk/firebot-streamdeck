export default interface PiAction {
    defaultSettings: () => Promise<void>;
    populateElements: () => Promise<void>;
    instanceUpdated: () => Promise<void>;
}
