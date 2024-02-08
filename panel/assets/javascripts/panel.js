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

    addItem(request, false);
});

//onload
document.addEventListener('DOMContentLoaded', function () {

    const app = $dom(gI('app'));
    const [inspector_panel, elements, inspect] = inspectorPanel();
    const search_panel = searchPanel();
    _inspect = inspect;
    _elements = elements;

    const div_panel = $dom('div').addClass('panel');
    const div_requests = $dom('div').addClass('requests');
    const div_inspector = $dom('div').addClass('inspector');

    div_requests.append(search_panel);
    div_inspector.append(inspector_panel);
    div_panel.append(div_requests);
    div_panel.append(div_inspector);
    app.append(div_panel);

    //load requests 
    getRequestList().then(requests => {
        requests.forEach(request => {
            addItem(request, true);
        });
    });

});


// reference api: https://developer.chrome.com/docs/extensions/reference/storage/
// chrome.storage.session.set({ key: value }).then(() => {
//     console.log("Value was set");
//   });

//   chrome.storage.session.get(["key"]).then((result) => {
//     console.log("Value is " + result.key);
//   });


function saveRequestToList(request) {
    chrome.storage.local.get(['requests'], function (result) {
        let requests = result.requests || [];
        requests.push(request);
        chrome.storage.local.set({ requests: requests }, function () {
            console.log('Value is set to ' + requests);
        });
    });
}

function getRequestList() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['requests'], function (result) {
            let requests = result.requests || [];
            console.log(requests);
            resolve(requests);
        });
    });
}

function deleteRequest(request) {
    chrome.storage.local.get(['requests'], function (result) {
        let requests = result.requests || [];
        requests = requests.filter(r => JSON.stringify(r) !== JSON.stringify(request));
        chrome.storage.local.set({ requests: requests }, function () {
            console.log('Value is set to ' + requests);
        });
    });
}