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

var _inspect = null;

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
    Console.addMessage(null, null, request);

    addItem(request);
});

//onload
document.addEventListener('DOMContentLoaded', function () {

    const app = $dom(gI('app'));
    const [inspector_panel, inspect] = create_inspector();
    _inspect = inspect;
    const search_panel = searchPanel();

    const div_panel = $dom('div').addClass('panel');
    const div_requests = $dom('div').addClass('requests');
    const div_inspector = $dom('div').addClass('inspector');

    div_requests.append(search_panel);
    div_inspector.append(inspector_panel);
    div_panel.append(div_requests);
    div_panel.append(div_inspector);
    app.append(div_panel);

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
                        .id('mainForm')
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
                                        .id('search')
                                        .addClass('search-box__input')
                                        .attr('type', 'text')
                                        .attr('name', 'search')
                                        .attr('placeholder', 'Search for names..')
                                        .on('keyup', filterDataWithFluentDom)
                                )
                        ).append(
                            $dom('ul')
                                .id('formList')
                                .addClass('form__list')

                        )
                )
        );

    return dom;
}

function inpect(request, inspector, elements) {
    console.log(request);
    console.log(inspector.element);
    console.log(elements);


    $dom(elements.select_method).val("");
    $dom(elements.input_url).val("");
    $dom(elements.textarea_request).text("");
    $dom(elements.textarea_response).text("");

    $dom(elements.select_method).val(request.request.method);
    $dom(elements.input_url).val(request.request.url);
    $dom(elements.textarea_request).text(beatify_json(request.request.postData) || "");
    $dom(elements.textarea_response).text(beatify_json(request.response.content.text) || "");

    elements.button_send.addEventListener('click', async () => {

        const url = request.request.url;
        const method = request.request.method;
        const body = request.request.postData;
        const cookies = request.request.cookies;

        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

        const headers = request.request.headers.reduce((acc, cur) => {
            if (/^[a-z0-9!#$%&'*+.^_`|~-]+$/i.test(cur.name)) {
                acc[cur.name] = cur.value;
            } else {
                console.warn(`Invalid header name: ${cur.name}`);
            }
            return acc;
        }, {});

        headers['Cookie'] = cookieString;

        const options = {
            method,
            headers,
            body,
            credentials: 'include' // or 'same-origin'  or 'omit'
        }

        try {
            const response = await fetch(url, options);
            const response_body = await response.text();
            console.log(response_body);
        } catch (error) {
            console.error(`Failed to fetch: ${error.message}`);
        }


        $dom(elements.textarea_response).text(beatify_json(response_body) || "");

    });
}


function create_inspector(conf) {

    const inspector = $dom('div').addClass('inspector');

    inspector.append($dom('h2').text("Inspector"));

    inspector
        .append(
            $dom("div")
                .append($dom("lable").text("Method"))
                .append($dom("select").id("method").append(
                    $dom("option").val("GET").text("GET"),
                    $dom("option").val("POST").text("POST"),
                    $dom("option").val("PUT").text("PUT"),
                    $dom("option").val("DELETE").text("DELETE"),
                ))
        )
        .append(
            $dom("div")
                .append($dom("input").attr("type", "text").attr("placeholder", "url"))
        )
        .append(
            $dom("div")
                .append($dom("textarea").attr("placeholder", "request body").id("request_body"))
        )
        .append(
            $dom("div")
                .append($dom("textarea").attr("placeholder", "Response body").id("response_body"))
        )
        .append(
            $dom("div")
                .append($dom("button").text("Re-send"))
        );


    const elements = {
        input_url: inspector.element.querySelector("input"),
        textarea_request: inspector.element.querySelector("#request_body"),
        textarea_response: inspector.element.querySelector("#response_body"),
        select_method: inspector.element.querySelector("#method"),
        button_send: inspector.element.querySelector("button")
    }

    return [
        inspector,
        (request) => { inpect(request, inspector, elements) }
    ]
}

function beatify_json(json) {
    return JSON.stringify(json, null, 4);
}