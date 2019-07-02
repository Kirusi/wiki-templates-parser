'use strict';

class TrackingVisitor {
    constructor() {
        this._history = [];
    }

    get history() {
        return this._history;
    }

    visitLink(link, displayText) {
        this._history.push(`LINK|${link}|${displayText}`);
    }

}

module.exports = TrackingVisitor;