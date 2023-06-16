"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'zorro-project';
exports.version = '0.1.0';
const API_URL = 'http://api.zorro.xyz';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const response = await (0, cross_fetch_1.default)(API_URL + '/getVerifiedExternalAddresses', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            purposeIdentifier: options.purposeIdentifier || space,
            externalAddresses: addresses,
            snapshot
        })
    });
    const { verifiedExternalAddresses } = await response.json();
    const lookup = Object.fromEntries(verifiedExternalAddresses.map((addr) => [addr.toLowerCase(), true]));
    const power = options.power || 1;
    return Object.fromEntries(addresses.map((address) => [
        address,
        lookup[address.toLowerCase()] ? power : 0
    ]));
}
exports.strategy = strategy;
