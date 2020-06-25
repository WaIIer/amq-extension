chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.includes("animemusicquiz")) {
        chrome.browserAction.setPopup({
            tabId: tabId,
            popup: "popup.html"
        });
    } else {
        chrome.browserAction.setPopup({
            tabId: tabId,
            popup: ""
        });
    }
});
