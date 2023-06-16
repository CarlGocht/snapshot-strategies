"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'iotexproject';
exports.version = '0.0.2';
const testNetUrl = 'https://analyser-api.testnet.iotex.io';
const mainNetUrl = 'https://analyser-api.iotex.io';
function getUrl(network) {
    return network == 4689 ? mainNetUrl : testNetUrl;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    if (blockTag == 'latest')
        return (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const apiUrl = getUrl(network);
    const response = await (0, cross_fetch_1.default)(`${apiUrl}/api.AccountService.Erc20TokenBalanceByHeight`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address: addresses,
            height: snapshot,
            contract_address: options.address
        })
    });
    const ret = await response.json();
    return Object.fromEntries(ret.balance.map((v, i) => [addresses[i], parseFloat(v)]));
}
exports.strategy = strategy;
