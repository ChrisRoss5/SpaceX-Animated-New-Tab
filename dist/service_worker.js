const tabsInfo = {};
const recentTabs = [];

/* https://developer.chrome.com/docs/extensions/reference/tabs/ */

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ recentTabs: [] });
  chrome.tabs.query({}, (tabs) =>
    tabs.forEach((tab) => (tabsInfo[tab.id] = tab))
  );
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const tabRemoved = tabsInfo[tabId];
  if (/^(chrome|data)/.test(tabRemoved.url)) return;
  recentTabs.unshift(tabRemoved);
  chrome.storage.local.set({ recentTabs });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  tabsInfo[tabId] = tab;
});
