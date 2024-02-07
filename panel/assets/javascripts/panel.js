Console.addMessage = function (type, format, obj) {
    chrome.runtime.sendMessage({
        command: "sendToConsole",
        tabId: chrome.devtools.inspectedWindow.tabId,
        args: [type, obj]
    });
};

chrome.devtools.network.onRequestFinished.addListener(function (request) {
    if (request.request.url.startsWith("chrome-extension://")) {
        return;
    }
    //Console.addMessage(null, null, request);

    addItem(request);
});

//onload
document.addEventListener('DOMContentLoaded', function () {

    const app = $dom(gI('app'));
    const [inspector_panel, inspect] = inspectorPanel();
    const search_panel = searchPanel();
    _inspect = inspect;

    const div_panel = $dom('div').addClass('panel');
    const div_requests = $dom('div').addClass('requests');
    const div_inspector = $dom('div').addClass('inspector');

    div_requests.append(search_panel);
    div_inspector.append(inspector_panel);
    div_panel.append(div_requests);
    div_panel.append(div_inspector);
    app.append(div_panel);

});