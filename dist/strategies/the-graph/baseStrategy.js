"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseStrategy = exports.getScoresPage = void 0;
const address_1 = require("@ethersproject/address");
const tokenLockWallets_1 = require("./tokenLockWallets");
const graphUtils_1 = require("./graphUtils");
const DEFAULT_PAGE_SIZE = 1000;
const VALID_STRATEGIES = ['balance', 'indexing', 'delegation'];
/**
 * Fetch scores for a list of addresses and their token-locked wallets
 *
 * @export
 * @param {string} _space snapshot space
 * @param {string} network networkId (i.e. ethereum mainnet = '1')
 * @param {Provider} _provider
 * @param {string[]} addresses
 * @param {GraphStrategyOptions} options
 * @param {(string | number)} snapshot 'latest' or blockNumber
 * @param {StrategyFunction} graphStrategy
 * @return {Promise<GraphAccountScores>} scores
 */
async function getScoresPage(_space, network, _provider, addresses, options, snapshot, graphStrategy) {
    const tokenLockWallets = await (0, tokenLockWallets_1.getTokenLockWallets)(_space, network, _provider, addresses, options, snapshot);
    // Take the token lock wallets object and turn it into an array, pass it into the other strategies
    const allAccounts = [...addresses];
    for (const beneficiary in tokenLockWallets) {
        tokenLockWallets[beneficiary].forEach((tw) => {
            allAccounts.push(tw);
        });
    }
    // Fetch scores for accounts and TLW
    const scores = await graphStrategy(_space, network, _provider, allAccounts, options, snapshot);
    // Only run tests for specific block
    if (options.expectedResults && snapshot !== 'latest') {
        (0, graphUtils_1.verifyResults)(JSON.stringify(scores), JSON.stringify(options.expectedResults.scores), 'Scores');
    }
    // Combine the Token lock votes into the beneficiaries votes
    const combinedScores = {};
    for (const account of addresses) {
        let accountScore = scores[account];
        // It was found that this beneficiary has token lock wallets, lets add them
        if (tokenLockWallets[account] != null) {
            tokenLockWallets[account].forEach((tw) => {
                accountScore = accountScore + scores[tw];
            });
        }
        combinedScores[account] = accountScore;
    }
    return combinedScores;
}
exports.getScoresPage = getScoresPage;
async function baseStrategy(_space, network, _provider, _addresses, options, snapshot, graphStrategy) {
    const addresses = _addresses.map((address) => address.toLowerCase());
    let combinedScores = {};
    if (VALID_STRATEGIES.includes(options.strategyType)) {
        // Paginate and get combined scores
        const pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
        const pages = (0, graphUtils_1.splitArray)(addresses, pageSize);
        for (const addressesPage of pages) {
            const pageScores = await getScoresPage(_space, network, _provider, addressesPage, { ...options, pageSize }, snapshot, graphStrategy);
            combinedScores = { ...combinedScores, ...pageScores };
        }
    }
    else {
        console.error('ERROR: Strategy does not exist');
        return combinedScores;
    }
    // Only run tests for specific block
    if (options.expectedResults && snapshot !== 'latest') {
        (0, graphUtils_1.verifyResults)(JSON.stringify(combinedScores), JSON.stringify(options.expectedResults.combinedScores), 'Combined scores');
    }
    return Object.fromEntries(Object.entries(combinedScores).map((score) => [
        (0, address_1.getAddress)(score[0]),
        score[1]
    ]));
}
exports.baseStrategy = baseStrategy;
