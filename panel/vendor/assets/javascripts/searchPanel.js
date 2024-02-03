// Define the persons array
const persons = [
    { name: "Adele", href: "#" },
    { name: "Agnes", href: "#" },
    { name: "Billy", href: "#" },
    { name: "Bob", href: "#" },
    { name: "Calvin", href: "#" },
    { name: "Christina", href: "#" },
    { name: "Cindy", href: "#" }
];

// Function to create the list and populate it with initial items
function createAndPopulateList(listID, parentEl) {
    let list = document.getElementById(listID);

    if (!list) {
        list = $dom('ul').attr('id', listID).addClass('form__list').element;
        parentEl.appendChild(list);

        persons.forEach(person => addItem(person, listID));
    }
}

// Function to add an item to the list
function addItem(item) {
    const list = document.getElementById('formList');
    if (!list) {
        console.error('List not found: ' + listID);
        return;
    }

    $dom('li')
        .addClass('form__item')
        .append(
            $dom('a')
                .addClass('form__link')
                .attr('href', item.href)
                .text(item.name)
        )
        .appendTo(list);
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
