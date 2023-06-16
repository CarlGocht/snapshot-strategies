"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
exports.author = 'bshyong';
exports.version = '0.2.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const recusalList = options?.addresses.map((address) => address.toLowerCase()) || [];
    if (options.strategy?.name) {
        const result = await __1.default[options.strategy.name].strategy(space, network, provider, addresses.filter((address) => !recusalList.includes(address.toLowerCase())), options.strategy.params, snapshot);
        return Object.fromEntries(Object.entries(result).map(([address, value]) => [
            address,
            recusalList.includes(address.toLowerCase()) ? 0 : value
        ]));
    }
    else {
        return Object.fromEntries(addresses.map((address) => [
            address,
            recusalList.includes(address.toLowerCase()) ? 0 : 1
        ]));
    }
}
exports.strategy = strategy;
