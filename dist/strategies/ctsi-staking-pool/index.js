"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'cartesi';
exports.version = '0.1.0';
const SUBGRAPH_URL_ROOT = 'https://api.thegraph.com/subgraphs/name/cartesi/pos';
const NETWORK_KEY = {
    '1': '',
    '5': '-goerli'
};
function buildSubgraphUrl(chainId) {
    const networkString = NETWORK_KEY[chainId];
    return `${SUBGRAPH_URL_ROOT}${networkString}`;
}
async function getStakingPoolDelegatorBalance(url, addresses, options, snapshot) {
    // query for StakingPool balance of voters
    const query = {
        poolBalances: {
            __args: {
                where: {
                    user_in: addresses
                },
                first: 1000
            },
            pool: {
                amount: true,
                shares: true,
                manager: true
            },
            user: {
                id: true
            },
            shares: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        query.poolBalances.__args.block = { number: snapshot };
    }
    const score = {};
    const result = await (0, utils_1.subgraphRequest)(url, query);
    if (result && result.poolBalances) {
        result.poolBalances.forEach((poolBalance) => {
            const address = (0, address_1.getAddress)(poolBalance.user.id);
            const poolShares = bignumber_1.FixedNumber.from(poolBalance.pool.shares);
            const poolAmount = bignumber_1.FixedNumber.from(poolBalance.pool.amount);
            const shares = bignumber_1.FixedNumber.from(poolBalance.shares);
            const balance = bignumber_1.BigNumber.from(poolAmount
                .mulUnsafe(shares.divUnsafe(poolShares))
                .floor()
                .toFormat('ufixed128x0')
                .toString());
            // a staker can stake to several pools, so we must add the value if there is already one
            score[address] = score[address] ? score[address].add(balance) : balance;
        });
    }
    return score;
}
function verifyResults(results, expectedResults) {
    Object.entries(results).forEach(([address, score]) => {
        const expectedScore = expectedResults[address.toLowerCase()] ??
            expectedResults[(0, address_1.getAddress)(address)];
        if (score !== expectedScore) {
            console.error(`>>> ERROR: Score do not match for address ${address}, expected ${expectedScore}, got ${score}`);
        }
    });
}
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    // convert addresses to lowercase, as in subgraph they are all lowercase
    addresses = addresses.map((address) => address.toLowerCase());
    // build subgraph URL based on network, as we have one for mainnet and another for goerli
    const url = buildSubgraphUrl(network);
    // get balance staked in pools
    const results = await getStakingPoolDelegatorBalance(url, addresses, options, snapshot);
    const scores = Object.fromEntries(Object.entries(results).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, 18))
    ]));
    if (options.expectedResults && snapshot !== 'latest') {
        // validate testing expected results
        verifyResults(scores, options.expectedResults.scores);
    }
    return scores;
}
exports.strategy = strategy;
