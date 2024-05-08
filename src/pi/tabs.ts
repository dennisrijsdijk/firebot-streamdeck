export function clickTab(clickedTab: Element) {
    const allTabs = Array.from(document.querySelectorAll('.tab')) as HTMLElement[];
    allTabs.forEach(el => el.classList.remove('selected'));
    clickedTab.classList.add('selected');
    allTabs.forEach((el: HTMLElement) => {
        if (el.dataset.target) {
            const tab = document.querySelector(el.dataset.target) as HTMLElement;
            if (tab) {
                tab.style.display = el === clickedTab ? 'block' : 'none';
            }
        }
    });
}

export function activateTabs() {
    const allTabs = Array.from(document.querySelectorAll('.tab')) as HTMLElement[];
    allTabs.forEach((el: HTMLElement) => {
        el.addEventListener('click', () => clickTab(el));
    });

    clickTab(allTabs[0]);
}