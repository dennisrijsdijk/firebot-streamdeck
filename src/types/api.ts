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