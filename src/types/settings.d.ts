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
    counterId?: string;
    counterLabel?: string;
    value?: number;
    overrideValue?: boolean;
}