import streamDeck from "@elgato/streamdeck";
import firebotManager from "./firebot-manager";

import { CounterAction } from "./actions/counter";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

streamDeck.settings.useExperimentalMessageIdentifiers = true;

// Register the increment action.
streamDeck.actions.registerAction(new CounterAction());

// Finally, connect to the Stream Deck.
await streamDeck.connect();

let globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();

if (globalSettings && Object.keys(globalSettings).length === 0) {
    globalSettings = {
        defaultEndpoint: "localhost",
        instances: [
            {
                endpoint: "localhost",
                name: "Localhost"
            }
        ]
    };
    await streamDeck.settings.setGlobalSettings<GlobalSettings>(globalSettings);
}

for (const instance of globalSettings.instances) {
    firebotManager.createInstance(instance);
}

firebotManager.ready = true;