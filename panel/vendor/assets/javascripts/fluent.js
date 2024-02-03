(function () {
    let FluentDom = function (node) {
        return new FluentDomInternal(node);
    }

    let FluentDomInternal = function (node) {

        if (node == null || node === undefined) {
            throw new Error("Node cannot be null or undefined");
        }
        else if (typeof node === "string") {
            return Fluent(document.createElement(node));
        }
        else if (node instanceof Element) {
            return Fluent(node);
        }
        else {
            throw new Error("Node must be a string or an Element");
        }
    }

    function Fluent(node) {

        return {
            element: node,
            text: function (text) {
                this.element.innerText = text;
                return this;
            },
            html: function (html) {
                this.element.innerHTML = html;
                return this;
            },
            attr: function (name, value) {
                this.element.setAttribute(name, value);
                return this;
            },
            addClass: function (className) {
                this.element.classList.add(className);
                return this;
            },
            removeClass: function (className) {
                this.element.classList.remove(className);
                return this;
            },
            append: function (node) {
                this.element.appendChild(node.element);
                return this;
            },
            prepend: function (node) {
                this.element.insertBefore(node.element, this.element.firstChild);
                return this;
            },
            val: function (value) {
                this.element.value = value;
                return this;
            },
            on: function (event, callback) {
                this.element.addEventListener(event, callback);
                return this;
            },
            title: function (title) {
                this.element.title = title;
                return this;
            },
            delete: function () {
                this.element.remove();
            },
            parent: function () {
                return Fluent(this.element.parentElement);
            },
            appendTo: function (parent) {
                if (parent instanceof Element) {
                    parent.appendChild(this.element);
                }
                return this;
            }
        }

    }

    window.FluentDom = window.$dom = FluentDom;
}());