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
});

//onload
document.addEventListener('DOMContentLoaded', function () {

    const app = $dom(gI('app'));
    const search_panel = searchPanel();

    const panel = $dom('div').addClass('panel');
    const requests = $dom('div').addClass('requests');
    const inspector = $dom('div').addClass('inspector');

    requests.append(search_panel);
    panel.append(requests);
    panel.append(inspector);
    app.append(panel);



    //init list
    const mainForm = document.querySelector('#mainForm');
    createAndPopulateList('formList', mainForm);
    const searchInput = document.querySelector('#search');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterDataWithFluentDom);
    }

});

function searchPanel() {
    const dom = $dom('div')
        .addClass('page')
        .append(
            $dom('main')
                .addClass('main')
                .addClass('page__main')
                .append(
                    $dom('form')
                        .attr('id', 'mainForm')
                        .addClass('form')
                        .addClass('main__form')
                        .attr('action', 'javascript:void(0);')
                        .attr('method', 'GET')
                        .append(
                            $dom('label')
                                .addClass('search-box')
                                .attr('for', 'search')
                                .append(
                                    $dom('span')
                                        .addClass('sr-only')
                                        .text('Search')
                                )
                                .append(
                                    $dom('i')
                                        .addClass('fa-search')
                                        .addClass('fa-solid')
                                        .addClass('search-box__icon')
                                )
                                .append(
                                    $dom('input')
                                        .addClass('search-box__input')
                                        .attr('type', 'text')
                                        .attr('id', 'search')
                                        .attr('name', 'search')
                                        .attr('placeholder', 'Search for names..')
                                )
                        )
                )
        );

    return dom;
}