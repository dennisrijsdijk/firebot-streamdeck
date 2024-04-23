export enum FirebotInstanceStatus {
    OFFLINE,
    ONLINE
}

export type FirebotInstanceData = {
    endpoint: string;
    name: string;
    status: FirebotInstanceStatus;
}

export type FirebotCounterData = {
    id: string;
    name: string;
}

export type FirebotCustomRoleData = {
    id: string;
    name: string;
}

export type FirebotQueueData = {
    id: string;
    name: string;
}

export type FirebotPresetEffectListData = {
    id: string;
    name: string;
    args: string[];
}