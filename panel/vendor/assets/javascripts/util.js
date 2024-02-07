function gI(id) {
    return document.getElementById(id);
}

(function () {
    // Extend Element prototype to track event listeners
    const oldAddEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (type, listener, options) {
        this._eventListeners = this._eventListeners || {};
        this._eventListeners[type] = this._eventListeners[type] || [];
        this._eventListeners[type].push({ listener, options });
        oldAddEventListener.call(this, type, listener, options);
    };

    // Optionally, override removeEventListener if you want to keep the list accurate
    const oldRemoveEventListener = Element.prototype.removeEventListener;
    Element.prototype.removeEventListener = function (type, listener, options) {
        if (this._eventListeners && this._eventListeners[type]) {
            const index = this._eventListeners[type].findIndex(event => event.listener === listener && event.options === options);
            if (index !== -1) {
                this._eventListeners[type].splice(index, 1);
            }
        }
        oldRemoveEventListener.call(this, type, listener, options);
    };

    // Method to remove all event listeners
    Element.prototype.removeAllEventListeners = function () {
        if (!this._eventListeners) return;

        for (const type in this._eventListeners) {
            if (this._eventListeners.hasOwnProperty(type)) {
                this._eventListeners[type].forEach(event => {
                    this.removeEventListener(type, event.listener, event.options);
                });
                this._eventListeners[type] = [];
            }
        }
    };
})();
