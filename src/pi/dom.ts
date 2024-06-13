export function createOption(name: string, value: string, selected: boolean): HTMLOptionElement {
    const option = document.createElement("option");
    option.text = name;
    option.value = value;
    option.selected = selected;
    return option;
}