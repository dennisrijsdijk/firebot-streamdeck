type SettingsInstance = {
    endpoint: string;
    name: string;
}

type GlobalSettings = {
    defaultEndpoint: string;
    instances: SettingsInstance[];
}

type BaseActionSettings<T> = {
    title?: string;
    endpoint?: string;
    action?: T;
}

type CounterActionSettings = {
    id?: string;
    label?: string;
    value?: number;
    action?: "update" | "set";
}

type PresetListActionSettings = {
    id?: string;
    label?: string;
    arguments?: Record<string, string>;
}

type CommandActionSettings = {
    id?: string;
    label?: string;
    args?: string;
}