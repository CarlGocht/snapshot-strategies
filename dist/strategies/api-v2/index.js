"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    let url = options.url;
    const additionalParameters = options.additionalParameters || '';
    const type = options.type || 'api-get';
    const method = type === 'api-post' ? 'POST' : 'GET';
    let body = null;
    if (!url)
        throw new Error('Invalid url');
    if (type === 'ipfs') {
        url = url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    else if (type === 'api-get') {
        url += '?network=' + network;
        url += '&snapshot=' + snapshot;
        url += '&addresses=' + addresses.join(',');
        if (additionalParameters)
            url += '&' + additionalParameters;
    }
    else if (type === 'api-post') {
        const requestBody = {
            options,
            network,
            snapshot,
            addresses
        };
        body = JSON.stringify(requestBody);
    }
    const snapshotSecretHeader = (0, utils_1.sha256)(`${url}${process.env.SNAPSHOT_API_STRATEGY_SALT}`);
    const response = await (0, cross_fetch_1.default)(url, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Snapshot-API-Strategy-Secret': snapshotSecretHeader
        },
        body
    });
    let responseData = await response.text();
    try {
        responseData = JSON.parse(responseData);
    }
    catch (e) {
        throw new Error(`[api-v2] Errors found in API: URL: ${url}, Status: ${response.status}` +
            response.ok
            ? `, Response: ${responseData.substring(0, 512)}`
            : '');
    }
    if (!responseData?.score)
        throw new Error('Invalid response from API');
    return Object.fromEntries(addresses.map((address) => [
        (0, address_1.getAddress)(address),
        parseFloat((0, units_1.formatUnits)(responseData.score
            .find((s) => s.address === address)
            ?.score?.toString() || '0', options.hasOwnProperty('decimals') ? options.decimals : 0))
    ]));
}
exports.strategy = strategy;
