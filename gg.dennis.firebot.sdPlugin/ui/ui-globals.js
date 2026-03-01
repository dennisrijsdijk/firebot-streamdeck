window.addInstance = async function(endpoint, name) {
    window.globalSettings.instances.forEach(i => {
        if (i.endpoint === endpoint) {
            throw new Error("Instance with the specified endpoint already exists.");
        }

        if (i.name === name) {
            throw new Error("Instance with the specified name already exists.");
        }
    });

    window.globalSettings.instances.push({ endpoint, name });
    await SDPIComponents.streamDeckClient.setGlobalSettings(window.globalSettings);
    await window.instancesUpdated();
}

window.setDefaultInstance = async function(endpoint) {
    if (window.globalSettings.defaultEndpoint === endpoint) {
        return;
    }

    window.globalSettings.defaultEndpoint = endpoint;
    await SDPIComponents.streamDeckClient.setGlobalSettings(window.globalSettings);
}

window.deleteInstance = async function(endpoint) {
    if (window.globalSettings.defaultEndpoint === endpoint) {
        throw new Error("Cannot delete the default instance. Please set a different default instance first.");
    }

    const index = window.globalSettings.instances.findIndex(i => i.endpoint === endpoint);
    if (index === -1) {
        throw new Error("Instance with the specified endpoint does not exist.");
    }

    window.globalSettings.instances.splice(index, 1);

    await SDPIComponents.streamDeckClient.setGlobalSettings(window.globalSettings);
    await window.instancesUpdated();
}

window.instancesUpdated = async function() {
    const instances = window.globalSettings.instances;

    window.instanceSelectContainer.style.display = instances.length > 1 ? "block" : "none";
    if (!instances.find(i => i.endpoint === window.instanceSelect.value)) {
        // Only force the new instance if there is exactly one instance available, or an instance was never set.
        // Otherwise, let the user select it manually because the instance selector is visible.
        window.instanceSelect.value = instances.length === 1 || window.instanceSelect.value == null ? window.globalSettings.defaultEndpoint : "";
    }
}

window.getGlobalSettings = async function(force = false) {
    if (!window.globalSettings || force) {
        window.globalSettings = await SDPIComponents.streamDeckClient.getGlobalSettings();
    }

    return window.globalSettings;
}

window.openInstanceManagementWindow = function() {
    if (window.instanceManagementWindow && !window.instanceManagementWindow.closed) {
        window.instanceManagementWindow.focus();
        console.log("Focused existing instance management window:", window.instanceManagementWindow);
        return;
    }

    window.instanceManagementWindow = window.open("manage-instances.html");
    
    console.log("Created instance management window:", window.instanceManagementWindow);
}

window.openVariablesExplorerWindow = function() {
    if (window.variablesExplorerWindow && !window.variablesExplorerWindow.closed) {
        window.variablesExplorerWindow.focus();
        console.log("Focused existing variables explorer window:", window.variablesExplorerWindow);
        return;
    }

    window.variablesExplorerWindow = window.open("variables-explorer.html");
    
    console.log("Created variables explorer window:", window.variablesExplorerWindow);
}

window.getVariableDefinitions = async function() {
    return new Promise((resolve) => {
        const listener = (event) => {
            if (event.payload.event !== "getVariables") {
                return;
            }

            resolve(event.payload.variables);
            SDPIComponents.streamDeckClient.sendToPropertyInspector.unsubscribe(listener);
        };

        SDPIComponents.streamDeckClient.sendToPropertyInspector.subscribe(listener);

        SDPIComponents.streamDeckClient.send("sendToPlugin", { event: "getVariables" });
    });
}

window.handleConnectionStateChanged = function(event) {
    if (event.payload.event !== "connectionStateChanged") {
        return;
    }

    if (event.payload.endpoint !== window.instanceSelect.value) {
        return;
    }

    document.getElementById("instance-not-connected-warning").style.display = event.payload.connected ? "none" : "block";
    document.getElementById("instance-not-connected-name").textContent = event.payload.name;

    let sendToPluginTarget;

    switch (window.connectionInfo.actionInfo.action) {
        case "gg.dennis.firebot.command":
            sendToPluginTarget = "getCommands";
            break;
        case "gg.dennis.firebot.counter":
            sendToPluginTarget = "getCounters";
            break;
        case "gg.dennis.firebot.customrole":
            sendToPluginTarget = "getCustomRoles";
            break;
        case "gg.dennis.firebot.presetlist":
            sendToPluginTarget = "getPresetLists";
            break;
        case "gg.dennis.firebot.queue":
            sendToPluginTarget = "getEffectQueues";
            break;
        case "gg.dennis.firebot.timer":
            sendToPluginTarget = "getTimers";
            break;
    }

    if (sendToPluginTarget) {
        SDPIComponents.streamDeckClient.send("sendToPlugin", { event: sendToPluginTarget });
    }
}

window.initializeUiGlobals = async function() {
    window.instanceSelect = document.getElementById("instance-select");
    window.instanceSelectContainer = document.getElementById("instance-select-container");

    window.connectionInfo = await SDPIComponents.streamDeckClient.getConnectionInfo();

    SDPIComponents.streamDeckClient.sendToPropertyInspector.subscribe(window.handleConnectionStateChanged);

    SDPIComponents.streamDeckClient.send("sendToPlugin", { event: "getInstanceConnectionState", endpoint: window.connectionInfo.actionInfo.payload.settings.endpoint });

    if (window.connectionInfo.actionInfo.payload.isInMultiAction) {
        document.getElementById("action-title").style.display = "none";
    }

    await window.getGlobalSettings();

    window.instancesUpdated();
}