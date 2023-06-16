"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.name = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'immutable';
exports.version = '1.0.0';
exports.name = 'immutable-x';
const snapshotPath = '/v1/snapshots/balances';
const networkMapping = {
    1: 'https://api.x.immutable.com',
    3: 'https://api.ropsten.x.immutable.com'
};
const defaultPageSize = 1000;
async function strategy(_space, network, provider, addresses, options, block = 'latest') {
    return combineBalanceScores([
        await getL2Balances(network, options, addresses, block),
        await (0, erc20_balance_of_1.strategy)(null, network, provider, addresses, options, block)
    ]);
}
exports.strategy = strategy;
async function getL2Balances(network, options, addresses, block) {
    const records = {};
    // Sanitize pageSize
    options.pageSize = options.pageSize || defaultPageSize;
    // Loop variables
    let cursor = '', receivedLen = 0;
    // Until all records are returned
    // This loop handles both:
    // 1. server-side paginated requests for all addresses available; and
    // 2. client-side paginated requests (addresses in json body of requests).
    // There are separate completion conditions for 1. and 2.
    while (true) {
        // Build URL
        const apiUrl = buildURL(network, options, block, cursor);
        // Send request
        const response = await (0, cross_fetch_1.default)(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                ether_keys: addresses.slice(receivedLen, receivedLen + options.pageSize)
            }),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        });
        // Decode response
        const resJson = await response.json();
        // Empty response indicates end of results
        // for requests without specified address in json body
        const respLen = resJson.records.length;
        if (respLen === 0) {
            break;
        }
        // Store result
        Object.assign(records, mapL2Response(resJson, options));
        // Iterate
        receivedLen += respLen;
        // This indicates we have received all results for
        // the addresses we asked for
        if (receivedLen >= addresses.length) {
            break;
        }
        // For paginated requests, continue w/ cursor
        cursor = resJson.cursor;
    }
    return records;
}
function buildURL(network, options, block, cursor) {
    let apiUrl = networkMapping[network] + snapshotPath;
    apiUrl += '/' + options.address.toLowerCase();
    apiUrl += `?page_size=${options.pageSize}`;
    apiUrl += typeof block === 'number' ? `&block=${block}` : '';
    apiUrl += cursor || cursor != '' ? `&cursor=${cursor}` : '';
    return apiUrl;
}
function mapL2Response(data, options) {
    return Object.fromEntries(data.records.map((value) => [
        value.ether_key,
        formatBalance(value.balance, options.decimals)
    ]));
}
function formatBalance(balance, decimals) {
    return parseFloat((0, units_1.formatUnits)(balance, decimals));
}
function combineBalanceScores(records) {
    return records.reduce((aggScore, currScore) => {
        for (const [address, balance] of Object.entries(currScore)) {
            if (!aggScore[address]) {
                aggScore[address] = balance;
            }
            else {
                aggScore[address] += balance; // sum(L1, L2)
            }
        }
        return aggScore;
    }, {});
}
