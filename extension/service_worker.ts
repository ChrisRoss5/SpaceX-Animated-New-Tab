/* https://developer.chrome.com/docs/extensions/reference/storage/ */
/* https://developer.chrome.com/docs/extensions/reference/tabs/ */

type TabsInfo = Record<number, chrome.tabs.Tab>;

const resetTabsStorage = () =>
  new Promise<void>((res) =>
    chrome.storage.local.set({ recentTabs: [], tabsInfo: {} }, res)
  );

chrome.runtime.onInstalled.addListener(resetTabsStorage);
chrome.runtime.onStartup.addListener(async () => {
  await resetTabsStorage();
  chrome.tabs.query({}, (tabs) => {
    const tabsInfo: TabsInfo = {};
    tabs.forEach((tab) => {
      if (tab.id) tabsInfo[tab.id] = tab;
    });
    chrome.storage.local.set({ tabsInfo });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.local.get("tabsInfo", (result) => {
    result.tabsInfo[tabId] = tab;
    chrome.storage.local.set(result);
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabsInfo", (result) => {
    const tabRemoved = result.tabsInfo[tabId];
    if (!tabRemoved || /^(chrome|data)/.test(tabRemoved.url)) return;
    chrome.storage.local.get("recentTabs", (result2) => {
      result2.recentTabs.unshift(tabRemoved);
      chrome.storage.local.set(result2);
    });
  });
});
