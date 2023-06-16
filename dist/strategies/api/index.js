"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
exports.author = 'ganzai-san';
exports.version = '0.1.2';
const isIPFS = (apiURL) => {
    return (apiURL.startsWith('https://gateway.pinata.cloud/ipfs/') ||
        apiURL.startsWith('https://ipfs.io/ipfs/') ||
        apiURL.startsWith('https://cloudflare-ipfs.com/ipfs/'));
};
const isStaticAPI = (apiURL) => {
    return apiURL.endsWith('.json');
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const api = options.api;
    const strategy = options.strategy || '';
    const additionalParameters = options.additionalParameters || '';
    const staticFile = options.staticFile || false;
    let api_url = api + '/' + strategy;
    if (!isIPFS(api_url) && !isStaticAPI(api_url) && !staticFile) {
        api_url += '?network=' + network;
        api_url += '&snapshot=' + snapshot;
        api_url += '&addresses=' + addresses.join(',');
    }
    if (additionalParameters)
        api_url += '&' + additionalParameters;
    const response = await (0, cross_fetch_1.default)(api_url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return Object.fromEntries(data.score.map((value) => [
        (0, address_1.getAddress)(value.address),
        parseFloat((0, units_1.formatUnits)(value.score.toString(), options.hasOwnProperty('decimals') ? options.decimals : 0))
    ]));
}
exports.strategy = strategy;
