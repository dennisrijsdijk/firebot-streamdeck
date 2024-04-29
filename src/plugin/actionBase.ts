import streamDeck, {
    Action,
    DidReceiveSettingsEvent,
    JsonObject,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent
} from "@elgato/streamdeck";
import { ActionBaseSettings } from "../types/settings";
import ReplaceVariablesManager from "./replaceVariablesManager";
import firebotService from "./firebot-api/service";

export class ActionBase<T extends JsonObject> extends SingletonAction<ActionBaseSettings<T>> {
    // "context": "manifestId"
    private readonly actions: Record<string, string>;

    constructor() {
        super();
        this.actions = {};
        firebotService.on('data_updated', async () => {
            await Promise.all(Object.keys(this.actions).map(async (context) => {
                const action = streamDeck.actions.createController(context);
                const manifestId = this.actions[context];
                return this.update(action, manifestId);
            }));
        });
    }

    async onWillAppear(ev: WillAppearEvent<ActionBaseSettings<T>>): Promise<void> {
        this.actions[ev.action.id] = ev.action.manifestId;
        return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
    }

    onWillDisappear(ev: WillDisappearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        delete this.actions[ev.action.id];
    }

    async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionBaseSettings<T>>) {
        return this.update(ev.action, ev.action.manifestId, ev.payload.settings);
    }

    async update(action: Omit<Action<ActionBaseSettings<T>>, "manifestId">, manifestId: string, newSettings?: ActionBaseSettings<T>): Promise<void> {
        if (newSettings == null) {
            // getSettings fires an onDidReceiveSettings event, causing the key to trigger twice if we don't return here
            await action.getSettings<ActionBaseSettings<T>>();
            return;
        }

        if (newSettings.endpoint == null || newSettings.title == null) {
            return;
        }

        const meta = {
            actionId: manifestId,
            settings: newSettings
        };

        const title = await ReplaceVariablesManager.evaluate(newSettings.title, meta);
        return action.setTitle(title);
    }
}