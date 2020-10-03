console.log("loaded extension");
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("sending custom");
    window.dispatchEvent(new CustomEvent("extensionButtonPressEvent", { detail: message }));
});
`s`;
