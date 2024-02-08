// Componets
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
                        .addClass('pure-form')
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
                                    $dom('input')
                                        .id('search')
                                        .addClass('search-box__input')
                                        .attr('type', 'text')
                                        .attr('name', 'search')
                                        .attr('placeholder', 'Search for names..')
                                        .on('keyup', filterRequests)
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

function inspectorPanel(conf) {

    const inspector = $dom('div').addClass('inspector');

    inspector.append($dom('h2').text("Inspector"));

    inspector
        .append($dom("div").append(
            $dom("form").addClass("pure-form")
                .append($dom("fieldset")
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
                        $dom("button").id("button_copy_request").type("button").addClass("pure-button", "pure-button-primary")
                            .append(fa("fa-solid", "fa-copy"))
                    )
                    .append(
                        $dom("button").id("button_filter_request").type("button").addClass("pure-button", "pure-button-primary")
                            .append(fa("fa-solid", "fa-filter"))
                    )
                    .append(
                        $dom("div")
                            .append($dom("textarea").attr("placeholder", "request body").id("request_body"))
                    )
                    .append(
                        $dom("button").id("button_copy_response").type("button").addClass("pure-button", "pure-button-primary")
                            .append(fa("fa-solid", "fa-copy"))
                    )
                    .append(
                        $dom("button").id("button_filter_response").type("button").addClass("pure-button", "pure-button-primary")
                            .append(fa("fa-solid", "fa-filter"))
                    )
                    .append(
                        $dom("div")
                            .append($dom("textarea").attr("placeholder", "Response body").id("response_body"))
                    )
                    .append(
                        $dom("div")
                            .append($dom("button").id("send-button").type("button").text("Re-send").addClass("pure-button", "pure-button-primary"))
                    )
                    .append(
                        $dom("div").id("result")
                    ))));

    const elements = {
        input_url: inspector.element.querySelector("input"),
        textarea_request: inspector.element.querySelector("#request_body"),
        textarea_response: inspector.element.querySelector("#response_body"),
        select_method: inspector.element.querySelector("#method"),
        button_send: inspector.element.querySelector("#send-button"),
        button_filter_request: inspector.element.querySelector("#button_filter_request"),
        button_filter_response: inspector.element.querySelector("#button_filter_response"),
        result: inspector.element.querySelector("#result"),
        button_copy_request: inspector.element.querySelector("#button_copy_request"),
        button_copy_response: inspector.element.querySelector("#button_copy_response")
    }

    $dom(elements.button_filter_request).on('click', () => {
        jsonPathfilter(elements.textarea_request, elements.result, "request")
    });

    $dom(elements.button_filter_response).on('click', () => {
        jsonPathfilter(elements.textarea_response, elements.result, "response")
    });

    $dom(elements.button_copy_request).on('click', () => {
        copyText(elements.textarea_request);
    });

    $dom(elements.button_copy_response).on('click', () => {
        copyText(elements.textarea_response);
    });


    return [
        inspector,
        elements,
        (request) => { inpect(request, inspector, elements) }
    ]
}

function filterResultPanel(result, path, type) {

    const div = $dom('div').append(
        $dom('p').text(type + " " + path),
        $dom('textarea').val(beatify_json(result) || ""),

        $dom('button').addClass("pure-button", "pure-button-primary").type("button").on('click', function () {
            $dom(this.parentElement).delete();
        }).append(fa("fa-solid", "fa-trash")),

        $dom('button').addClass("pure-button", "pure-button-primary").type("button").on('click', function () {
            copyText(this.parentElement.querySelector("textarea"));
        }).append(fa("fa-solid", "fa-copy"))

    );

    return div;

}

// ============================================================================================================

function jsonPathfilter(textarea, result_div, type) {
    if (!textarea.value || textarea.value.trim() === "") return;

    const json = JSON.parse(textarea.value);
    const path = prompt("Enter jsonPath expression:");
    let result = null;
    try {
        result = jsonpath.query(json, path);
    } catch (e) {
        alert("Invalid jsonPath expression");
        return;
    }
    console.log(result);
    //  $dom(textarea).val(beatify_json(result) || "");

    $dom(result_div).append(filterResultPanel(result, path, type));
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
    $dom(elements.textarea_request).val(beatify_json(request.request.postData) || "");
    $dom(elements.textarea_response).val(beatify_json(request.response.content.text) || "");

    // Replace the button with a clone to remove the event listener
    const clone = elements.button_send.cloneNode(true);

    clone.addEventListener('click', async () => {

        const response_body = await reSendRequest(request, elements);

        $dom(elements.textarea_response).text(beatify_json(response_body) || "");

    });

    // i did not find a way to remove the event listener so i just replace the button with a clone
    // not elegant but it works
    const parent = $dom(gI("send-button")).parent();
    const send_button = $dom(gI("send-button"));
    send_button.delete();
    parent.append($dom(clone));
}

// Function to add an item to the list
function addItem(request) {
    const list = document.getElementById('formList');
    const url = request.request.url;
    const method = request.request.method;

    $dom('li')
        .addClass('form__item')
        .append(
            $dom('a')
                .addClass('form__link')
                .text(`${method} :  ${url}`)
                .onClick(function () {
                    _inspect(request)
                })
        )
        .prependTo(list);
}

// Function to filter the list items based on user input
function filterRequests(event) {
    const val = event.target.value.toLowerCase();
    const list = document.getElementById('formList');

    Array.from(list.children).forEach(li => {
        const dataVal = li.textContent.toLowerCase();
        //if (dataVal.startsWith(val)) {
        if (dataVal.includes(val)) {
            li.classList.remove('form__item_hidden');
        } else {
            li.classList.add('form__item_hidden');
        }
    });
}

function beatify_json(json) {
    return JSON.stringify(json, null, 4);
}

function fa(...clazz) {
    let dom = $dom("i");

    clazz.forEach(element => {
        dom.addClass(element);
    });

    return dom;
}

function copyText(textarea) {
    textarea.select();
    document.execCommand('copy');
}

async function reSendRequest(request, elements) {


    const url = request.request.url;
    const method = request.request.method;
    const cookies = request.request.cookies;
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    let body = "";

    const headers = request.request.headers.reduce((acc, cur) => {
        if (/^[a-z0-9!#$%&'*+.^_`|~-]+$/i.test(cur.name)) {
            acc[cur.name] = cur.value;
        } else {
            console.warn(`Invalid header name: ${cur.name}`);
        }
        return acc;
    }, {});

    if (elements.textarea_request.value && elements.textarea_request.value.trim() !== "") {

        try {
            body = JSON.stringify(JSON.parse(elements.textarea_request.value));
        } catch (error) {
            console.error(`Failed to parse request body: ${error.message}`);
            return;
        }
    }


    headers['Cookie'] = cookieString;

    const options = {
        "method": method,
        "headers": headers,
        "body": body,
        "cache": "no-cache"
    }

    try {
        const response = await fetch(url, options);
        const response_body = await response.text();
        console.log(response_body);
    } catch (error) {
        console.error(`Failed to fetch: ${error.message}`);
    }

    return response_body;
}