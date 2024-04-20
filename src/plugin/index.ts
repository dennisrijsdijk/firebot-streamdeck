import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { GlobalSettings } from "../types/settings";
import actions from "./actions";
import firebotService from './firebot-api/service';

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
actions.forEach(action => streamDeck.actions.registerAction(action));

// Finally, connect to the Stream Deck.
await streamDeck.connect();

let globalSettings = await streamDeck.settings.getGlobalSettings<GlobalSettings>();

if (Object.keys(globalSettings).length === 0) {
    globalSettings = {
        defaultEndpoint: "127.0.0.1",
        instances: [
            {
                endpoint: "127.0.0.1",
                name: "Localhost"
            }
        ]
    };
    await streamDeck.settings.setGlobalSettings<GlobalSettings>(globalSettings);
}

await firebotService.updateInstances(globalSettings.instances);

streamDeck.settings.onDidReceiveGlobalSettings<GlobalSettings>(async ev => {
    await firebotService.updateInstances(ev.settings.instances);
});