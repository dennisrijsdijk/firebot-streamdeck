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

    onWillAppear(ev: WillAppearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        this.actions.push(ev.action.id);
    }

    onWillDisappear(ev: WillDisappearEvent<ActionBaseSettings<T>>): Promise<void> | void {
        const index = this.actions.indexOf(ev.action.id);
        if (index != -1) {
            this.actions.splice(index, 1);
        }
    }

    async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ActionBaseSettings<T>>) {
        return this.update(ev.action);
    }

    async update(action: Omit<Action<ActionBaseSettings<T>>, "manifestId">) {
        // Key drawing logic here with expressionish and firebot
    }
}