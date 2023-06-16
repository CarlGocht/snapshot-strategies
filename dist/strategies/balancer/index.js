"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'bonustrack';
exports.version = '0.2.0';
const BALANCER_SUBGRAPH_URL_ROOT = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer';
const NETWORK_KEY = {
    '1': '',
    '42': '-kovan',
    '137': '-polygon',
    '42161': '-arbitrum'
};
function buildBalancerSubgraphUrl(chainId, version) {
    const networkString = NETWORK_KEY[chainId];
    const versionString = version == 2 ? '-v2' : '';
    return `${BALANCER_SUBGRAPH_URL_ROOT}${networkString}${versionString}`;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const params = {
        poolShares: {
            __args: {
                where: {
                    userAddress_in: addresses.map((address) => address.toLowerCase()),
                    balance_gt: 0
                },
                first: 1000,
                orderBy: 'balance',
                orderDirection: 'desc'
            },
            userAddress: {
                id: true
            },
            balance: true,
            poolId: {
                totalShares: true,
                tokens: {
                    id: true,
                    balance: true
                }
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.poolShares.__args.block = { number: snapshot };
    }
    // iterate through Balancer V1 & V2 Subgraphs
    const score = {};
    for (let version = 1; version <= 2; version++) {
        // Skip attempt to query subgraph on networks where V1 isn't deployed
        if (network != 1 && network != 42 && version === 1)
            continue;
        const result = await (0, utils_1.subgraphRequest)(buildBalancerSubgraphUrl(network, version), params);
        if (result && result.poolShares) {
            result.poolShares.forEach((poolShare) => poolShare.poolId.tokens.map((poolToken) => {
                const [, tokenAddress] = poolToken.id.split('-');
                if (tokenAddress === options.address.toLowerCase()) {
                    const userAddress = (0, address_1.getAddress)(poolShare.userAddress.id);
                    if (!score[userAddress])
                        score[userAddress] = 0;
                    score[userAddress] =
                        score[userAddress] +
                            (poolToken.balance / poolShare.poolId.totalShares) *
                                poolShare.balance;
                }
            }));
        }
    }
    return score || {};
}
exports.strategy = strategy;
