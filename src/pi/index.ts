import streamDeck, { ActionInfo, JsonObject, RegistrationInfo } from "@elgato/streamdeck";
import { ActionBaseSettings, GlobalSettings } from "../types/settings";
import { activateTabs } from "./tabs";
import $ from 'jquery';
import PiAction from "./piAction";
import settingsCache from "./settingsCache";
import { getAction } from "./actions";

let titleUpdateDebounce: ReturnType<typeof setTimeout>;

function populateInstanceSelects() {
    const instanceSelect = $('#sdpi-action-instance-select');
    const instanceManagement = $('#sdpi-instance-management-select');
    const instanceManagementSetDefault = $('#sdpi-set-default-instance-button');
    const instanceManagementDelete = $('#sdpi-delete-instance-button');

    instanceSelect.find('option').remove();
    instanceManagement.find('option').remove();

    for (let idx = 0; idx < settingsCache.global.instances.length; idx++) {
        const instance = settingsCache.global.instances[idx];
        instanceSelect.append(new Option(
            instance.name,
            instance.endpoint,
            instance.endpoint === settingsCache.global.defaultEndpoint,
            instance.endpoint === settingsCache.action.endpoint
        ));
        instanceManagement.append(
            new Option(
                `${instance.name} (${instance.endpoint}) ${instance.endpoint === settingsCache.global.defaultEndpoint ? "[DEFAULT]" : ""}`,
                instance.endpoint,
                idx === 0,
                instance.endpoint === settingsCache.global.defaultEndpoint
            )
        );

        const selected = instanceManagement.find("option:selected");
        const disable = selected.val() as string === settingsCache.global.defaultEndpoint;
        instanceManagementSetDefault.prop("disabled", disable);
        instanceManagementDelete.prop("disabled", disable);
    }
}

function populateGlobalElements(action: PiAction) {
    const instanceSelect = $('#sdpi-action-instance-select');
    const instanceManagement = $('#sdpi-instance-management-select');
    const instanceManagementDefault = $('#sdpi-set-default-instance-button');
    const instanceManagementDelete = $('#sdpi-delete-instance-button');
    const title = $('#sd-title-format');

    populateInstanceSelects();

    title.val(settingsCache.action.title);

    title.on('input', function () {
        clearTimeout(titleUpdateDebounce);
        titleUpdateDebounce = setTimeout(() => {
            settingsCache.action.title = title.val() as string;
            return settingsCache.saveAction();
        }, 50);
    });

    instanceSelect.on('change', async function () {
        const selected = instanceSelect.find("option:selected");
        settingsCache.action.endpoint = selected.val() as string;
        await settingsCache.saveAction();
        await action.instanceUpdated();
    });

    instanceManagement.on('change', async function () {
        const selected = instanceManagement.find("option:selected");
        const disable = selected.val() as string === settingsCache.global.defaultEndpoint;
        instanceManagementDefault.prop("disabled", disable);
        instanceManagementDelete.prop("disabled", disable);
    });

    instanceManagementDefault.on('click', async () => {
        if (instanceManagementDefault.prop("disabled")) {
            return;
        }

        settingsCache.global.defaultEndpoint = instanceManagement.find("option:selected").val() as string;
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    instanceManagementDelete.on('click', async () => {
        if (instanceManagementDelete.prop("disabled")) {
            return;
        }

        const endpoint = instanceManagement.find("option:selected").val() as string;
        const index = settingsCache.global.instances.findIndex(instance => instance.endpoint === endpoint);
        if (index === -1) {
            return;
        }

        settingsCache.global.instances.splice(index, 1);
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    const newInstanceName = $('#sdpi-new-instance-name');
    const newInstanceEndpoint = $('#sdpi-new-instance-endpoint');
    const newInstanceButton = $('#sdpi-create-new-instance-button');
    const newInstanceErrorDiv = $('#sdpi-new-instance-error-div');
    const newInstanceError = $('#sdpi-create-new-instance-error');

    newInstanceButton.on('click', async () => {
        const index = settingsCache.global.instances.findIndex((instance) => {
            if (instance.name.toLowerCase() === (newInstanceName.val() as string).toLowerCase()) {
                newInstanceError.val("Instance Name already in use.");
                return true;
            }
            if (instance.endpoint === newInstanceEndpoint.val()) {
                newInstanceError.val("Instance Endpoint already in use.");
                return true;
            }
            return false;
        });
        if (index !== -1) {
            newInstanceErrorDiv.show(200);
            return;
        }

        newInstanceErrorDiv.hide(200);

        const name = newInstanceName.val() as string;
        const endpoint = newInstanceEndpoint.val() as string;
        newInstanceName.val("");
        newInstanceEndpoint.val("");

        settingsCache.global.instances.push({
            endpoint,
            name
        });

        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });
}

streamDeck.onDidConnect(async (registration: RegistrationInfo, actionInfo: ActionInfo) => {
    settingsCache.global = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    settingsCache.action = actionInfo.payload.settings as ActionBaseSettings<JsonObject>;

    const action = getAction(actionInfo.action);

    if (!action) {
        return;
    }

    if (Object.keys(actionInfo.payload.settings as object).length === 0) {
        await action.defaultSettings();
    }

    populateGlobalElements(action);
    await action.populateElements();

    activateTabs();
});