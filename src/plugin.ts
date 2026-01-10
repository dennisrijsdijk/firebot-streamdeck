import streamDeck from "@elgato/streamdeck";
import firebotManager from "./firebot-manager";

import { CommandAction } from "./actions/command";
import { CounterAction } from "./actions/counter";
import { CustomRoleAction } from "./actions/custom-role";
import { CustomVariableAction } from "./actions/custom-variable";
import { PresetListAction } from "./actions/preset-effect-list";
import { QueueAction } from "./actions/queue";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("trace");

streamDeck.settings.useExperimentalMessageIdentifiers = true;

// Register the increment action.
streamDeck.actions.registerAction(new CommandAction());
streamDeck.actions.registerAction(new CounterAction());
streamDeck.actions.registerAction(new CustomRoleAction());
streamDeck.actions.registerAction(new CustomVariableAction());
streamDeck.actions.registerAction(new PresetListAction());
streamDeck.actions.registerAction(new QueueAction());

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