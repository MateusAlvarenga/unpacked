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
    $dom(elements.textarea_request).val(beatify_json(request.request.postData) || "");
    $dom(elements.textarea_response).val(beatify_json(request.response.content.text) || "");

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
                .append($dom("button").id("send-button").text("Re-send"))
        )
        .append(
            $dom("button").id("filter-button").text("Filter"),
            $dom("button").id("filter-button2").text("Filter")
        )
        .append(
            $dom("div").id("result")
        );


    const elements = {
        input_url: inspector.element.querySelector("input"),
        textarea_request: inspector.element.querySelector("#request_body"),
        textarea_response: inspector.element.querySelector("#response_body"),
        select_method: inspector.element.querySelector("#method"),
        button_send: inspector.element.querySelector("#send-button"),
        button_filter: inspector.element.querySelector("#filter-button"),
        button_filter2: inspector.element.querySelector("#filter-button2"),
        result: inspector.element.querySelector("#result")
    }

    $dom(elements.button_filter).on('click', () => {
        filter(elements.textarea_request, elements.result, "request")
    });

    $dom(elements.button_filter2).on('click', () => {
        filter(elements.textarea_response, elements.result, "response")
    });

    return [
        inspector,
        (request) => { inpect(request, inspector, elements) }
    ]
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
                .on('click', function () {
                    _inspect(request)
                })
        )
        .prependTo(list);
}

// Function to filter the list items based on user input
function filterDataWithFluentDom(event) {
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

function filterResult(result, path, type){

    const div = $dom('div').append(
        $dom('p').text(type + " " + path),
        $dom('textarea').val(beatify_json(result) || ""),
        $dom('button').text("delete").on('click', function(){
            $dom(this.parentElement).delete();
        })
    );

    return div;

}

function beatify_json(json) {
    return JSON.stringify(json, null, 4);
}

function filter(textarea, result_div, type) {
    if(!textarea.value || textarea.value.trim() === "") return;

    const json = JSON.parse(textarea.value);
    const path = prompt("Enter jsonPath expression:");
    let result = null;
    try{
          result = jsonpath.query(json, path);
    }catch(e){
        console.error(e);
        alert("Invalid jsonPath expression");
        return;
    }
    console.log(result);
  //  $dom(textarea).val(beatify_json(result) || "");

    $dom(result_div).append(filterResult(result, path,type));
}
