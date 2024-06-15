import streamDeck, { ActionInfo, JsonObject, RegistrationInfo } from "@elgato/streamdeck";
import { ActionBaseSettings, GlobalSettings } from "../types/settings";
import { activateTabs } from "./tabs";
import * as dom from "./dom";
import PiAction from "./piAction";
import settingsCache from "./settingsCache";
import { getAction } from "./actions";

const instanceSelect = document.getElementById('instance') as HTMLSelectElement;
const instanceManagementSelect = document.getElementById('management') as HTMLSelectElement;
const title = document.getElementById('title') as HTMLInputElement;

const newInstanceName = document.getElementById('instance-name') as HTMLInputElement;
const newInstanceEndpoint = document.getElementById('instance-endpoint') as HTMLInputElement;
const newInstanceButton = document.getElementById('create') as HTMLButtonElement;
const newInstanceErrorDiv = document.getElementById('error-div') as HTMLDivElement;
const newInstanceError = document.getElementById('error');

const instanceManagementSetDefault = document.getElementById('default') as HTMLButtonElement;
const instanceManagementDelete = document.getElementById('delete') as HTMLButtonElement;


function updateManagementButtons(endpoint: string) {
    if (endpoint === settingsCache.global.defaultEndpoint) {
        instanceManagementSetDefault.setAttribute('disabled', '');
        instanceManagementDelete.setAttribute('disabled', '');
    } else {
        instanceManagementSetDefault.removeAttribute('disabled');
        instanceManagementDelete.removeAttribute('disabled');
    }
}

async function populateInstanceSelects() {
    instanceSelect.innerHTML = '';
    instanceManagementSelect.innerHTML = '';

    for (const instance of settingsCache.global.instances) {
        const option = dom.createOption(instance.name, instance.endpoint, instance.endpoint === settingsCache.global.defaultEndpoint);
        const managementOption = dom.createOption(
            `${instance.name} (${instance.endpoint}) ${instance.endpoint === settingsCache.global.defaultEndpoint ? "[DEFAULT]" : ""}`,
            instance.endpoint,
            instance.endpoint === settingsCache.action.endpoint
        );

        instanceSelect.add(option);
        instanceManagementSelect.add(managementOption);
    }

    if (instanceSelect.value !== settingsCache.action.endpoint) {
        instanceSelect.value = settingsCache.global.defaultEndpoint;
        settingsCache.action.endpoint = settingsCache.global.defaultEndpoint;
        await settingsCache.saveAction();
    }

    instanceManagementSelect.value = instanceSelect.value;

    updateManagementButtons(instanceManagementSelect.value);
}

async function populateGlobalElements(action: PiAction) {
    await populateInstanceSelects();

    title.value = settingsCache.action.title;

    title.addEventListener('input', async () => {
        settingsCache.action.title = title.value;
        await settingsCache.saveAction();
    });

    instanceSelect.addEventListener('change', async () => {
        settingsCache.action.endpoint = instanceSelect.value;
        await settingsCache.saveAction();
        await action.instanceUpdated();
    });

    instanceManagementSelect.addEventListener('change', async () => {
        updateManagementButtons(instanceManagementSelect.value);
    });

    instanceManagementSetDefault.addEventListener('click', async () => {
        if (instanceManagementSetDefault.disabled) {
            return;
        }

        settingsCache.global.defaultEndpoint = instanceManagementSelect.value;
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    instanceManagementDelete.addEventListener('click', async () => {
        if (instanceManagementDelete.disabled) {
            return;
        }

        const endpoint = instanceManagementSelect.value;
        const index = settingsCache.global.instances.findIndex(instance => instance.endpoint === endpoint);
        if (index === -1) {
            return;
        }

        settingsCache.global.instances.splice(index, 1);
        await settingsCache.saveGlobal();
        populateInstanceSelects();
    });

    newInstanceButton.addEventListener('click', async () => {
        const index = settingsCache.global.instances.findIndex((instance) => {
            if (instance.name.toLowerCase() === (newInstanceName.value).toLowerCase()) {
                newInstanceError.innerText = "Instance Name already in use.";
                return true;
            }
            if (instance.endpoint.toLowerCase() === newInstanceEndpoint.value) {
                newInstanceError.innerText = "Instance Endpoint already in use.";
                return true;
            }
            return false;
        });
        if (index !== -1) {
            newInstanceErrorDiv.classList.replace('hide', 'show');
            return;
        }

        newInstanceErrorDiv.classList.replace('show', 'hide');

        const name = newInstanceName.value;
        const endpoint = newInstanceEndpoint.value;
        newInstanceName.value = "";
        newInstanceEndpoint.value = "";

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

    await populateGlobalElements(action);
    await action.populateElements();

    activateTabs();
});