import streamDeck, { DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, Action } from "@elgato/streamdeck";
import { JsonObject } from "@elgato/utils";

type CachedAction<T> = {
    settings: BaseActionSettings<T>;
    title?: string;
}

export class BaseAction<T extends JsonObject> extends SingletonAction<BaseActionSettings<T>> {
    private readonly actionsCache: Record<string, CachedAction<T>> = {};

    constructor() {
        super();
        this.actionsCache = {};
    }

    override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<T>>): Promise<void> {
        this.actionsCache[ev.action.id] = {
            settings: ev.payload.settings,
        };
        // TODO: listen for data updates from Firebot to update title dynamically
        return this.update(ev.action);
    }

    override onWillDisappear(ev: WillDisappearEvent<BaseActionSettings<T>>): Promise<void> | void {
        delete this.actionsCache[ev.action.id];
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<BaseActionSettings<T>>): Promise<void> {
        if (!this.actionsCache[ev.action.id]) {
            return;
        }
        this.actionsCache[ev.action.id].settings = ev.payload.settings;
        return this.update(ev.action);
    }

    async saveCachedSettings(actionId: string, settings: BaseActionSettings<T>): Promise<void> {
        if (!this.actionsCache[actionId]) {
            return;
        }
        this.actionsCache[actionId].settings = settings;
        return this.update(streamDeck.actions.getActionById(actionId));
    }

    async update(action?: (WillAppearEvent | DidReceiveSettingsEvent)["action"]) {
        if (!action || !action.isKey()) {
            return;
        }

        const cachedAction = this.actionsCache[action.id];
        if (!cachedAction) {
            return;
        }

        const meta = {
            actionId: action.manifestId,
            settings: cachedAction.settings,
        }

        // TODO: Use expressionish here
        const title = meta.settings.title || "";

        if (cachedAction.title === title) {
            return;
        }

        cachedAction.title = title;
        return action.setTitle(title);
    }
}