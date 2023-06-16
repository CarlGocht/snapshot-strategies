"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validation {
    id = '';
    github = '';
    version = '';
    title = '';
    description = '';
    author;
    space;
    network;
    snapshot;
    params;
    constructor(author, space, network, snapshot, params) {
        this.author = author;
        this.space = space;
        this.network = network;
        this.snapshot = snapshot;
        this.params = params;
    }
    async validate() {
        return true;
    }
}
exports.default = Validation;
