'use strict';

class Context {
    constructor() {
        this._visitors = [];
        this._posArgs = [];
        this._namedArgs = {};
    }

    get visitors() {
        return this._visitors;
    }

    get posArgs() {
        return this._posArgs;
    }

    get namedArgs() {
        return this._namedArgs;
    }

};

module.exports = Context;