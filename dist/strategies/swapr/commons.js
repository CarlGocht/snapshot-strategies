"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeBalanceMaps = exports.SWAPR_SUBGRAPH_URL = void 0;
exports.SWAPR_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/luzzif/swapr-mainnet-v2',
    '100': 'https://api.thegraph.com/subgraphs/name/luzzif/swapr-xdai-v2',
    '42161': 'https://api.thegraph.com/subgraphs/name/luzzif/swapr-arbitrum-one-v2'
};
const mergeBalanceMaps = (outputMap, inputMap) => {
    Object.entries(inputMap).forEach(([account, balance]) => {
        outputMap[account] = (outputMap[account] || 0) + balance;
    });
};
exports.mergeBalanceMaps = mergeBalanceMaps;
