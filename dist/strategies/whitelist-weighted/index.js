"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
exports.author = 'vsergeev';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options) {
    const whitelist = Object.fromEntries(Object.entries(options?.addresses).map(([addr, weight]) => [
        addr.toLowerCase(),
        weight
    ]));
    return Object.fromEntries(addresses.map((address) => [address, whitelist[address.toLowerCase()] || 0]));
}
exports.strategy = strategy;
