"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenLockWallets = exports.TOKEN_DISTRIBUTION_SUBGRAPH_URL = void 0;
const utils_1 = require("../../utils");
const graphUtils_1 = require("./graphUtils");
exports.TOKEN_DISTRIBUTION_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/graphprotocol/token-distribution',
    '4': 'https://api.thegraph.com/subgraphs/name/davekaj/token-distribution-rinkeby'
};
/**
  @dev Queries the subgraph to find if an address owns any token lock wallets
  @returns An object with the beneficiaries as keys and TLWs as values in an array
*/
async function getTokenLockWallets(_space, network, _provider, addresses, options, snapshot) {
    const tokenLockParams = {
        tokenLockWallets: {
            __args: {
                where: {
                    beneficiary_in: addresses
                },
                first: options.pageSize
            },
            id: true,
            beneficiary: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        tokenLockParams.tokenLockWallets.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(exports.TOKEN_DISTRIBUTION_SUBGRAPH_URL[network], tokenLockParams);
    const tokenLockWallets = {};
    if (result && result.tokenLockWallets) {
        if (options.expectedResults) {
            (0, graphUtils_1.verifyResults)(JSON.stringify(result.tokenLockWallets), JSON.stringify(options.expectedResults.tokenLockWallets), 'Token lock wallets');
        }
        result.tokenLockWallets.forEach((tw) => {
            if (tokenLockWallets[tw.beneficiary] == undefined)
                tokenLockWallets[tw.beneficiary] = [];
            tokenLockWallets[tw.beneficiary] = tokenLockWallets[tw.beneficiary].concat(tw.id);
        });
    }
    else {
        console.error('Subgraph request failed');
    }
    return tokenLockWallets || {};
}
exports.getTokenLockWallets = getTokenLockWallets;
