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

// Initialize the list and setup event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const parentEl = document.querySelector('#mainForm'); // Adjust the selector as needed
    createAndPopulateList('formList', parentEl);

    const searchInput = document.querySelector('#search');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterDataWithFluentDom);
    }
});
