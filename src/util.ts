import { FirebotInstance } from "./types/firebot";

export function getPropertyAtPath(obj: any, path: string[]): any {
    return path.reduce((o, p) => ((p === "" || p == null) && !(p in o) ? o : o ? o[p] : undefined), obj);
}

export function setPropertyAtPath(obj: any, path: string[], value: any): any {
    let objCopy = structuredClone(obj);

    if (objCopy == null) {
        objCopy = isNaN(Number(path[0])) ? {} : [];
    }

    const lastPart = path[path.length - 1];
    const target = path.reduce((o, p, i, a) => {
        if (!o[p]) {
            o[p] = !isNaN(Number(a[i + 1])) ? [] : {};
        }
        return i === a.length - 1 ? o : o[p];
    }, objCopy);

    // Follow Firebot behavior, if the value is null, remove the property
    if (value == null || value === "null") {
        if (Array.isArray(target)) {
            target.splice(Number(lastPart), 1);
        } else if (target != null && typeof target === 'object') {
            delete target[lastPart];
        }
    // Follow Firebot behavior, if the target is an array, append to it instead of overwriting
    } else if (Array.isArray(target[lastPart])) {
        target[lastPart].push(value);
    } else if (target != null && typeof target === 'object') {
        target[lastPart] = value;
    }

    return objCopy;
}

export function getCustomVariable(name: string, instance?: FirebotInstance, propertyPath?: string | string[]): unknown {
    if (!instance || !instance.connected || !name || name.trim() === "") {
        return null;
    }

    const pathParts = Array.isArray(propertyPath) ? propertyPath : propertyPath?.split('.') ?? [];
    let variable = instance.data.customVariables[name];
    if (variable == null) {
        return null;
    }
    if (pathParts.length > 0) {
        variable = getPropertyAtPath(variable, pathParts);
    }

    return typeof variable === "string" ? variable : JSON.stringify(variable);
}