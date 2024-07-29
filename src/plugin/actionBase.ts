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

export type CachedAction<T> = {
    manifestId: string;
    settings: ActionBaseSettings<T>;
    title?: string;
}

export class ActionBase<T extends JsonObject> extends SingletonAction<ActionBaseSettings<T>> {
    private readonly actions: Record<string, CachedAction<T>>;

    constructor() {
        super();
        this.actions = {};
        firebotService.on('data_updated', async (endpoint: string) => {
            await Promise.all(Object.keys(this.actions).map(async (context) => {
                if (this.actions[context].settings.endpoint !== endpoint) {
                    return;
                }
                const action = streamDeck.actions.createController(context);
                const cachedAction = this.actions[context];
                return this.update(action, cachedAction);
            }));
        });
    }

    async onWillAppear(ev: WillAppearEvent<ActionBaseSettings<T>>): Promise<void> {
        this.actions[ev.action.id] = {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        };
        return this.update(ev.action, this.actions[ev.action.id]);
    }

    onWillDisappear(ev: WillDisappearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        delete this.actions[ev.action.id];
    }

    async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionBaseSettings<T>>) {
        if (this.actions[ev.action.id] == null) {
            return;
        }
        this.actions[ev.action.id].settings = ev.payload.settings;
        return this.update(ev.action, this.actions[ev.action.id]);
    }

    async update(action: Omit<Action<ActionBaseSettings<T>>, "manifestId">, cachedAction: CachedAction<T>): Promise<void> {
        const meta = {
            actionId: cachedAction.manifestId,
            settings: cachedAction.settings
        };

        const title = await ReplaceVariablesManager.evaluate(meta.settings.title, meta);

        if (cachedAction.title === title) {
            return;
        }

        cachedAction.title = title;
        return action.setTitle(title);
    }
}