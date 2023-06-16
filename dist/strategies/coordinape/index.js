"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const address_1 = require("@ethersproject/address");
exports.author = 'bonustrack';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const ts = (await provider.getBlock(snapshot)).timestamp;
    const url = `https://api.coordinape.com/api/${options.circle}/token-gifts?latest_epoch=1&timestamp=${ts}&snapshot=${snapshot}`;
    const res = await (0, cross_fetch_1.default)(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const gifts = await res.json();
    const scores = {};
    gifts.forEach((gift) => {
        const address = (0, address_1.getAddress)(gift.recipient_address);
        if (!scores[address])
            scores[address] = 0;
        scores[address] += gift.tokens;
    });
    return Object.fromEntries(addresses.map((address) => [address, scores[(0, address_1.getAddress)(address)] || 0]));
}
exports.strategy = strategy;
