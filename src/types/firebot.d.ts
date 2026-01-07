import { FirebotClient, CommandType } from "@dennisrijsdijk/node-firebot";

export type FirebotInstance = {
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
        presetEffectLists: Record<string, {
            id: string;
            name: string;
            argumentNames: string[];
        }>;
    }
}