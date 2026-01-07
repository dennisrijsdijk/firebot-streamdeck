import streamDeck, { DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, Action } from "@elgato/streamdeck";
import { JsonObject } from "@elgato/utils";
import firebotManager from "./firebot-manager";
import { ReplaceVariableTrigger } from "./types/replace-variables";
import { findAndReplaceVariables } from "./variables";

type CachedAction<T> = {
    settings: BaseActionSettings<T>;
    title?: string;
}

export class BaseAction<T extends JsonObject> extends SingletonAction<BaseActionSettings<T>> {
    private readonly actionsCache: Record<string, CachedAction<T>> = {};

    constructor() {
        super();
        this.actionsCache = {};

        firebotManager.on("variablesDataUpdated", async (instance) => {
            await Promise.all(Object.entries(this.actionsCache).map(async ([actionId, cachedAction]) => {
                if (cachedAction.settings.endpoint !== instance.endpoint) {
                    return;
                }
                return this.update(streamDeck.actions.getActionById(actionId));
            }));
        });
    }

    protected async waitUntilReady(): Promise<void> {
        while (!firebotManager.ready) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    protected async populateSettings(ev: WillAppearEvent<BaseActionSettings<T>>, settings: T): Promise<void> {
        if (Object.keys(ev.payload.settings).length !== 0) {
            return;
        }

        await this.waitUntilReady();

        const newSettings: BaseActionSettings<T> = {
            endpoint: firebotManager.defaultEndpoint,
            title: "",
            action: settings,
        };
        await ev.action.setSettings(newSettings);
        await this.saveCachedSettings(ev.action.id, newSettings);
    }

    override async onWillAppear(ev: WillAppearEvent<BaseActionSettings<T>>): Promise<void> {
        this.actionsCache[ev.action.id] = {
            settings: ev.payload.settings,
        };
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

    async update(action?: (Action<BaseActionSettings<T>>)) {
        if (!action || !action.isKey()) {
            return;
        }

        const cachedAction = this.actionsCache[action.id];
        if (!cachedAction) {
            return;
        }

        streamDeck.logger.info(`Received update for action ${action.manifestId} (${action.id}) with settings: ${JSON.stringify(cachedAction.settings)}`);

        const meta: ReplaceVariableTrigger<T> = {
            actionId: action.manifestId,
            settings: cachedAction.settings,
        }

        await this.waitUntilReady();

        const title = await findAndReplaceVariables(cachedAction.settings.title || "", meta);

        streamDeck.logger.info(`Generated title for action ${action.manifestId} (${action.id}): ${title}`);
        
        if (cachedAction.title === title) {
            return;
        }

        streamDeck.logger.info(`Updating title for action ${action.manifestId} (${action.id}) to: ${title}`);

        cachedAction.title = typeof title === "string" ? title : JSON.stringify(title);
        return action.setTitle(cachedAction.title);
    }
}