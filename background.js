chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (true || tab.url.includes("animemusicquiz")) {
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
