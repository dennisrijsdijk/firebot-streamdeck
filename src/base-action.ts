import streamDeck, { DidReceiveSettingsEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, Action } from "@elgato/streamdeck";
import { JsonObject } from "@elgato/utils";
import firebotManager from "./firebot-manager";
import { findAndReplaceVariables } from "./variables";
import { ReplaceVariableTrigger } from "./types/replace-variables";
import { FirebotInstance } from "./types/firebot";

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

    async instanceChanged(actionId: string, settings: BaseActionSettings<T>) { }

    protected async waitUntilReady(): Promise<void> {
        while (!firebotManager.ready) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
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

        if (this.actionsCache[ev.action.id].settings.endpoint !== ev.payload.settings.endpoint) {
            await this.instanceChanged(ev.action.id, ev.payload.settings)
        }

        this.actionsCache[ev.action.id].settings = ev.payload.settings;
        return this.update(ev.action);
    }

    async update(action?: (Action<BaseActionSettings<T>>)) {
        if (!action || !action.isKey() || action.isInMultiAction()) {
            return;
        }

        const cachedAction = this.actionsCache[action.id];
        if (!cachedAction) {
            return;
        }

        streamDeck.logger.info(`Received update for action ${action.manifestId} (${action.id}) with settings: ${JSON.stringify(cachedAction.settings)}`);

        await this.waitUntilReady();

        let instance: FirebotInstance;

        try {
            instance = firebotManager.getInstance(cachedAction.settings.endpoint || "");
        } catch {
            streamDeck.logger.warn(`No Firebot instance found for action ${action.manifestId} (${action.id}) with endpoint: ${cachedAction.settings.endpoint}`);
            return;
        }

        const meta: ReplaceVariableTrigger<T> = {
            actionId: action.manifestId,
            settings: cachedAction.settings,
            instance
        }

        let title: string | object = cachedAction.settings.title || "";

        try {
            title = await findAndReplaceVariables(cachedAction.settings.title || "", meta) as string | object;
        } catch (error) {
            streamDeck.logger.error(`Failed to replace variables in title for action ${action.manifestId} (${action.id}): ${error}`);
        }

        streamDeck.logger.info(`Generated title for action ${action.manifestId} (${action.id}): ${title}`);
        
        if (cachedAction.title === title) {
            return;
        }

        streamDeck.logger.info(`Updating title for action ${action.manifestId} (${action.id}) to: ${title}`);

        cachedAction.title = typeof title === "string" ? title : JSON.stringify(title);
        return action.setTitle(cachedAction.title);
    }
}