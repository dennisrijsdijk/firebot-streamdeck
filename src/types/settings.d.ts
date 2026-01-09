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

type CommandActionSettings = {
    id?: string;
    label?: string;
    args?: string;
}

type CounterActionSettings = {
    id?: string;
    label?: string;
    value?: number;
    action?: "update" | "set";
}

type CustomRoleActionSettings = {
    id?: string;
    label?: string;
}

type CustomVariableActionSettings = {
    name?: string;
    value?: string;
    propertyPath?: string;
}

type PresetListActionSettings = {
    id?: string;
    label?: string;
    arguments?: Record<string, string>;
}