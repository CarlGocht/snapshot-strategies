"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const swapr_lps_1 = require("./swapr-lps");
const erc20_balance_of_1 = require("../erc20-balance-of");
const commons_1 = require("./commons");
const address_1 = require("@ethersproject/address");
exports.author = 'luzzif';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const lpData = await (0, swapr_lps_1.getSwaprLiquidityProvidersBalance)(network, addresses, options, snapshot);
    let i = 0;
    const PAGE_SIZE = 250;
    let rawErc20HoldersData = {};
    while (true) {
        const pageData = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses.slice(PAGE_SIZE * i, PAGE_SIZE * i + PAGE_SIZE), options, snapshot);
        rawErc20HoldersData = { ...rawErc20HoldersData, ...pageData };
        if (Object.keys(pageData).length < PAGE_SIZE)
            break;
        i++;
    }
    // make sure the addresses have the correct casing before
    // merging the balance maps
    const erc20HoldersData = Object.entries(rawErc20HoldersData).reduce((accumulator, [address, balance]) => {
        accumulator[(0, address_1.getAddress)(address)] = balance;
        return accumulator;
    }, {});
    const score = {};
    (0, commons_1.mergeBalanceMaps)(score, lpData);
    (0, commons_1.mergeBalanceMaps)(score, erc20HoldersData);
    return score;
}
exports.strategy = strategy;
