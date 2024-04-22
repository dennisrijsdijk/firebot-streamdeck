import {JsonObject} from "@elgato/streamdeck";

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
} & JsonObject;

export type CounterSettings = {
    id: string | null;
    value: number;
    action: "update" | "set";
}

export type QueueSettings = {
    id: string | null;
    action: "pause" | "resume" | "toggle" | "clear";
}