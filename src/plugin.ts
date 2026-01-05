import streamDeck from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());

// Finally, connect to the Stream Deck.
await streamDeck.connect();

const globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();

if (globalSettings && Object.keys(globalSettings).length === 0) {
    await streamDeck.settings.setGlobalSettings<GlobalSettings>({
        defaultEndpoint: "localhost",
        instances: [
            {
                endpoint: "localhost",
                name: "Localhost"
            }
        ]
    });
}