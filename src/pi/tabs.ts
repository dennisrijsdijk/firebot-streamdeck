export function activateTabs(activeTab: any) {
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    let activeTabEl = null;
    allTabs.forEach((el: any) => {
        el.onclick = () => clickTab(el);
        if(el.dataset?.target === activeTab) {
            activeTabEl = el;
        }
    });
    if(activeTabEl) {
        clickTab(activeTabEl);
    } else if(allTabs.length) {
        clickTab(allTabs[0]);
    }
}

export function clickTab(clickedTab: any) {
    const allTabs = Array.from(document.querySelectorAll('.tab'));
    allTabs.forEach((el) => el.classList.remove('selected'));
    clickedTab.classList.add('selected');
    allTabs.forEach((el: any) => {
        if(el.dataset.target) {
            const t = document.querySelector(el.dataset.target);
            if(t) {
                t.style.display = el == clickedTab ? 'block' : 'none';
            }
        }
    });
}