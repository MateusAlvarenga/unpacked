
function Console() { }
Console.Type = {
    LOG: "log",
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    GROUP: "group",
    GROUP_COLLAPSED: "groupCollapsed",
    GROUP_END: "groupEnd"
};

Console.addMessage = function (type, format, args) {
    chrome.runtime.sendMessage({
        command: "sendToConsole",
        tabId: chrome.devtools.inspectedWindow.tabId,
        args: arguments
    });
};

chrome.devtools.network.onRequestFinished.addListener(function (request) {
    // do not show requests to chrome extension resources
    if (request.request.url.startsWith("chrome-extension://")) {
        return;
    }
    Console.addMessage(null, null, request);
    $scope.handleSAMLHeaders(request);
});