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