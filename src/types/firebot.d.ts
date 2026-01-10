import { FirebotClient, CommandType, QueueMode } from "@dennisrijsdijk/node-firebot";

export type FirebotInstance = {
    connected: boolean;
    client: FirebotClient;
    endpoint: string;
    name: string;
    data: {
        commands: Record<string, {
            id: string;
            trigger: string;
            type: CommandType;
        }>;
        counters: Record<string, {
            id: string;
            name: string;
            value: number;
        }>;
        customRoles: Record<string, {
            id: string;
            name: string;
            count: number;
        }>;
        customVariables: Record<string, unknown>;
        presetEffectLists: Record<string, {
            id: string;
            name: string;
            argumentNames: string[];
        }>;
        queues: Record<string, {
            id: string;
            name: string;
            type: QueueMode;
            active: boolean;
            length: number;
        }>;
        timers: Record<string, {
            id: string;
            name: string;
            active: boolean;
        }>;
    }
}