import streamDeck, {ActionInfo, RegistrationInfo} from "@elgato/streamdeck";
import { GlobalSettings } from "../types/settings";
import { activateTabs } from "./tabs";
import $ from 'jquery';
import PiAction from "./piAction";
import settingsCache from "./settingsCache";
import {getAction} from "./actions";

let titleUpdateDebounce: ReturnType<typeof setTimeout>;

function populateInstanceSelects() {
    const instance_select = $('#sdpi-action-instance-select');
    const instance_management = $('#sdpi-instance-management-select');
    const instance_management_set_default = $('#sdpi-set-default-instance-button');
    const instance_management_delete = $('#sdpi-delete-instance-button');

    instance_select.find('option').remove();
    instance_management.find('option').remove();

    for (let i = 0; i < settingsCache.global.instances.length; i++) {
        const instance = settingsCache.global.instances[i];
        instance_select.append(new Option(
            instance.name,
            instance.endpoint,
            instance.endpoint === settingsCache.global.defaultEndpoint,
            instance.endpoint === settingsCache.action.endpoint
        ));
        instance_management.append(
            new Option(
                `${instance.name} (${instance.endpoint}) ${instance.endpoint === settingsCache.global.defaultEndpoint ? "[DEFAULT]" : ""}`,
                instance.endpoint,
                i === 0,
                instance.endpoint === settingsCache.global.defaultEndpoint
            )
        );

        const selected = instance_management.find("option:selected");
        const disable = selected.val() as string === settingsCache.global.defaultEndpoint;
        instance_management_set_default.prop("disabled", disable);
        instance_management_delete.prop("disabled", disable);
    }
}

function populateGlobalElements(action: PiAction) {
    const instance_select = $('#sdpi-action-instance-select');
    const instance_management = $('#sdpi-instance-management-select');
    const instance_management_set_default = $('#sdpi-set-default-instance-button');
    const instance_management_delete = $('#sdpi-delete-instance-button');
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

    instance_select.on('change', async function () {
        const selected = instance_select.find("option:selected");
        settingsCache.action.endpoint = selected.val() as string;
        await settingsCache.saveAction();
        await action.instanceUpdated();
    });

    instance_management.on('change', async function () {
        const selected = instance_management.find("option:selected");
        const disable = selected.val() as string === settingsCache.global.defaultEndpoint;
        instance_management_set_default.prop("disabled", disable);
        instance_management_delete.prop("disabled", disable);
    });

    instance_management_set_default.on('click', async () => {
        if (instance_management_set_default.prop("disabled")) {
            return;
        }

        settingsCache.global.defaultEndpoint = instance_management.find("option:selected").val() as string;
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    instance_management_delete.on('click', async () => {
        if (instance_management_delete.prop("disabled")) {
            return;
        }

        const endpoint = instance_management.find("option:selected").val() as string;
        const index = settingsCache.global.instances.findIndex(instance => instance.endpoint === endpoint);
        if (index === -1) {
            return;
        }

        settingsCache.global.instances.splice(index, 1);
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    const new_instance_name = $('#sdpi-new-instance-name');
    const new_instance_endpoint = $('#sdpi-new-instance-endpoint');
    const new_instance_button = $('#sdpi-create-new-instance-button');
    const new_instance_error_div = $('#sdpi-new-instance-error-div');
    const new_instance_error = $('#sdpi-create-new-instance-error');

    new_instance_button.on('click', async () => {
        const index = settingsCache.global.instances.findIndex((instance) => {
            if (instance.name.toLowerCase() === (new_instance_name.val() as string).toLowerCase()) {
                new_instance_error.val("Instance Name already in use.");
                return true;
            }
            if (instance.endpoint === new_instance_endpoint.val()) {
                new_instance_error.val("Instance Endpoint already in use.");
                return true;
            }
            return false;
        });
        if (index !== -1) {
            new_instance_error_div.show(200);
            return;
        }

        new_instance_error_div.hide(200);

        const name = new_instance_name.val() as string;
        const endpoint = new_instance_endpoint.val() as string;
        new_instance_name.val("");
        new_instance_endpoint.val("");

        settingsCache.global.instances.push({
            endpoint,
            name
        });

        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });
}

streamDeck.onDidConnect(async (registration: RegistrationInfo, actionInfo: ActionInfo<any>) => {
    settingsCache.global = await streamDeck.settings.getGlobalSettings<GlobalSettings>();
    settingsCache.action = actionInfo.payload.settings;

    const action = getAction(actionInfo.action);

    if (!action) {
        return;
    }

    if (Object.keys(actionInfo.payload.settings).length === 0) {
        await action.defaultSettings();
    }

    populateGlobalElements(action);
    await action.populateElements();

    activateTabs(null);
});