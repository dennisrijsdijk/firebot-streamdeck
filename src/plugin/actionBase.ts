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
    private readonly cachedActions: Record<string, CachedAction<T>>;

    constructor() {
        super();
        this.cachedActions = {};
        firebotService.on('data_updated', async (endpoint: string) => {
            await Promise.all(Object.keys(this.cachedActions).map(async (context) => {
                if (this.cachedActions[context].settings.endpoint !== endpoint) {
                    return;
                }
                const action = streamDeck.actions.getActionById(context);
                const cachedAction = this.cachedActions[context];
                return this.update(action, cachedAction);
            }));
        });
    }

    override async onWillAppear(ev: WillAppearEvent<ActionBaseSettings<T>>): Promise<void> {
        this.cachedActions[ev.action.id] = {
            manifestId: ev.action.manifestId,
            settings: ev.payload.settings
        };
        return this.update(ev.action, this.cachedActions[ev.action.id]);
    }

    override onWillDisappear(ev: WillDisappearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        delete this.cachedActions[ev.action.id];
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionBaseSettings<T>>) {
        if (this.cachedActions[ev.action.id] == null) {
            return;
        }
        this.cachedActions[ev.action.id].settings = ev.payload.settings;
        return this.update(ev.action, this.cachedActions[ev.action.id]);
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
        if (action.isKey()) {
            return action.setTitle(title);
        }
    }
}