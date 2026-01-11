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
    args?: string;
}

type CounterActionSettings = {
    id?: string;
    value?: number;
    action?: "update" | "set";
}

type CustomRoleActionSettings = {
    id?: string;
}

type CustomVariableActionSettings = {
    name?: string;
    value?: string;
    propertyPath?: string;
}

type PresetListActionSettings = {
    id?: string;
    arguments?: Record<string, string>;
}

type QueueActionSettings = {
    id?: string;
    action?: "" | "pause" | "resume" | "toggle" | "clear" | "trigger";
}

type TimerActionSettings = {
    id?: string;
    action?: "enable" | "disable" | "toggle" | "clear";
}