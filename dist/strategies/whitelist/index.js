"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
exports.author = 'bonustrack';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options) {
    const whitelist = options?.addresses.map((address) => address.toLowerCase());
    return Object.fromEntries(addresses.map((address) => [
        address,
        whitelist.includes(address.toLowerCase()) ? 1 : 0
    ]));
}
exports.strategy = strategy;
