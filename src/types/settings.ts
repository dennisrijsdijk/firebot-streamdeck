export type SettingsInstance = {
    endpoint: string;
    name: string;
}

export type GlobalSettings = {
    defaultEndpoint: string;
    instances: SettingsInstance[];
}

export type ActionBaseSettings<TAction> = {
    title: string;
    endpoint: string;
    action: TAction;
};

export type CommandSettings = {
    id: string | null;
    args: string;
}

export type CounterSettings = {
    id: string | null;
    value: number;
    action: "update" | "set";
}

export type CustomRoleSettings = {
    id: string | null;
}

export type QueueSettings = {
    id: string | null;
    action: "pause" | "resume" | "toggle" | "clear";
}

export type PresetEffectListSettings = {
    id: string | null;
    arguments: Record<string, string>;
}

export type TimerSettings = {
    id: string | null;
    action: "pause" | "resume" | "toggle" | "clear";
}