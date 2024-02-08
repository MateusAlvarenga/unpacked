
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