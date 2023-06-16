"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
exports.author = 'miertschink';
exports.version = '0.1.1';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const requestBody = {
        options,
        network,
        snapshot,
        addresses
    };
    const response = await (0, cross_fetch_1.default)(options.api, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    return Object.fromEntries(data.score.map((value) => [
        (0, address_1.getAddress)(value.address),
        parseFloat((0, units_1.formatUnits)(value.score.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
