
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

Console.addMessage = function (type, obj) {
    chrome.runtime.sendMessage({
        command: "sendToConsole",
        tabId: chrome.devtools.inspectedWindow.tabId,
        args: {
            obj: obj,
            type: type
        }
    });
};

chrome.devtools.network.onRequestFinished.addListener(function (request) {
    if (request.request.url.startsWith("chrome-extension://")) {
        return;
    }
    Console.addMessage(Console.Type.INFO, request);
});

//onload
document.addEventListener('DOMContentLoaded', function () {

    const app = gI('app');

    $dom(app).append(
        $dom('div').addClass('header').append(
            $dom('h1').text('Panel')
        ),
        $dom('div').addClass('content').append(
            $dom('p').text('This is the panel content.')
        )
    );

});