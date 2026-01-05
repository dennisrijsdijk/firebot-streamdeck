import { FirebotClient } from "@dennisrijsdijk/node-firebot";

export type FirebotInstance = {
    client: FirebotClient;
    endpoint: string;
    name: string;
    data: {
        counters: Record<string, {
            id: string;
            name: string;
            value: number;
        }>;
    }
}