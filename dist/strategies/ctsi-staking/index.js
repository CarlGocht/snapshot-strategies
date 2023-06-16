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
async function getStakingBalance(url, addresses, options, snapshot) {
    // query for direct stakers (no pools)
    const query = {
        users: {
            __args: {
                where: {
                    id_in: addresses,
                    pool: null
                },
                first: 1000
            },
            id: true,
            balance: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        query.users.__args.block = { number: snapshot };
    }
    const score = {};
    const result = await (0, utils_1.subgraphRequest)(url, query);
    if (result && result.users) {
        result.users.forEach((user) => {
            const address = (0, address_1.getAddress)(user.id);
            const balance = bignumber_1.BigNumber.from(user.balance);
            score[address] = balance;
        });
    }
    return score;
}
async function getStakingPoolOperatorBalance(url, addresses, options, snapshot) {
    // query for StakingPools by manager (pool operator)
    const query = {
        stakingPools: {
            __args: {
                where: {
                    manager_in: addresses
                },
                first: 1000
            },
            manager: true,
            user: {
                balance: true
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        query.stakingPools.__args.block = { number: snapshot };
    }
    const score = {};
    const result = await (0, utils_1.subgraphRequest)(url, query);
    if (result && result.stakingPools) {
        result.stakingPools.forEach((pool) => {
            const address = (0, address_1.getAddress)(pool.manager);
            const balance = bignumber_1.BigNumber.from(pool.user.balance);
            // a pool operator can operate more than one pool, so we must add the value if there is already one
            score[address] = score[address] ? score[address].add(balance) : balance;
        });
    }
    return score;
}
function combineBalanceScores(records) {
    return records.reduce((aggScore, currScore) => {
        for (const [address, balance] of Object.entries(currScore)) {
            if (!aggScore[address]) {
                aggScore[address] = balance;
            }
            else {
                aggScore[address] = aggScore[address].add(balance); // sum(L1, L2)
            }
        }
        return aggScore;
    }, {});
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
    // get staking balance for all direct stakers as voters (no pools, no delegators)
    const directStaking = await getStakingBalance(url, addresses, options, snapshot);
    // get balance of pools operated by voters
    const operators = await getStakingPoolOperatorBalance(url, addresses, options, snapshot);
    const results = combineBalanceScores([directStaking, operators]);
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
