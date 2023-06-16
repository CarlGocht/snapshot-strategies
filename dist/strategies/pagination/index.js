"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
exports.author = 'bonustrack';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const max = options.limit || 300;
    const pages = Math.ceil(addresses.length / max);
    const promises = [];
    Array.from(Array(pages)).forEach((x, i) => {
        const addressesInPage = addresses.slice(max * i, max * (i + 1));
        promises.push(__1.default[options.strategy.name].strategy(space, network, provider, addressesInPage, options.strategy.params, snapshot));
    });
    const results = await Promise.all(promises);
    // @ts-ignore
    return results.reduce((obj, result) => ({ ...obj, ...result }), {});
}
exports.strategy = strategy;
