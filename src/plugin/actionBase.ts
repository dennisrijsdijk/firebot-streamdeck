import streamDeck, {
    Action,
    DidReceiveSettingsEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent
} from "@elgato/streamdeck";
import {ActionBaseSettings} from "../types/settings";

export class ActionBase<T> extends SingletonAction<ActionBaseSettings<T>> {
    private readonly actions: string[];
    
    constructor() {
        super();
        this.actions = [];
    }

    async onWillAppear(ev: WillAppearEvent<ActionBaseSettings<T>>): Promise<void> {
        this.actions.push(ev.action.id);
        return this.update(ev.action, ev.payload.settings);
    }

    onWillDisappear(ev: WillDisappearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        const index = this.actions.indexOf(ev.action.id);
        if (index != -1) {
            this.actions.splice(index, 1);
        }
    }

    async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionBaseSettings<T>>) {
        return this.update(ev.action, ev.payload.settings);
    }

    async update(action: Omit<Action<ActionBaseSettings<T>>, "manifestId">, newSettings?: ActionBaseSettings<T>): Promise<void> {
        if (newSettings == null) {
            newSettings = await action.getSettings<ActionBaseSettings<T>>();
        }
        if (newSettings.endpoint == null || newSettings.title == null) {
            return;
        }
        // Key drawing logic here with expressionish and firebot. For now, just draw title.
        return action.setTitle(newSettings.title);
    }
}