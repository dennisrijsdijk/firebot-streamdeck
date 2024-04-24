import {FirebotCommandData, FirebotPresetEffectListData, FirebotTimerData} from "./firebot";

export type ApiCounter = {
    id: string;
    name: string;
    value: number;
}

export type ApiQueue = {
    id: string;
    name: string;
    length: number;
    active: boolean;
}

export type ApiQueueUpdateResponse = {
    id: string;
    name: string;
    queue: object[];
    active: boolean;
}

export type ApiCustomRole = {
    id: string;
    name: string;
    viewers: object[];
}

export type ApiTimer = FirebotTimerData;

export type ApiCommand = Omit<FirebotCommandData, "type">;

export type ApiPresetEffectList = FirebotPresetEffectListData;