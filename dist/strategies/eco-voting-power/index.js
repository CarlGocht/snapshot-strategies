"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const constants_1 = require("@ethersproject/constants");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'carlosfebres';
exports.version = '1.0.1';
const ECO_SUBGRAPH_BY_CHAIN_ID = {
    '1': 'https://api.thegraph.com/subgraphs/name/ecographs/the-eco-currency-subgraphs',
    '5': 'https://api.thegraph.com/subgraphs/name/ecographs/staging-subgraphs'
};
const TOKEN_DELEGATEES_FIELDS = {
    amount: true,
    delegator: {
        id: true
    }
};
function calculateVotingPower(ecoVp, stakedEcoXVp) {
    return stakedEcoXVp.add(ecoVp.div(10));
}
function createDelegationList(items, inflationMultiplier = constants_1.One) {
    return Object.fromEntries(items.map((item) => [
        item.delegator.id,
        bignumber_1.BigNumber.from(item.amount).div(inflationMultiplier)
    ]));
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const _addresses = addresses.map((addr) => addr.toLowerCase());
    const blockNumber = snapshot !== 'latest' ? snapshot : await (0, utils_1.getBlockNumber)(provider);
    const baseFilter = {
        blockStarted_lte: blockNumber,
        delegator_in: _addresses
    };
    const query = {
        account: {
            __args: { id: options.delegatee.toLowerCase() },
            ecoTokenDelegatees: {
                __aliasFor: 'tokenDelegatees',
                __args: {
                    where: {
                        ...baseFilter,
                        token: 'eco',
                        blockEnded_gt: blockNumber
                    }
                },
                ...TOKEN_DELEGATEES_FIELDS
            },
            ecoCurrentTokenDelegatees: {
                __aliasFor: 'tokenDelegatees',
                __args: {
                    where: {
                        ...baseFilter,
                        token: 'eco',
                        blockEnded: null
                    }
                },
                ...TOKEN_DELEGATEES_FIELDS
            },
            stakedEcoXTokenDelegatees: {
                __aliasFor: 'tokenDelegatees',
                __args: {
                    where: {
                        ...baseFilter,
                        token: 'sEcox',
                        blockEnded_gt: blockNumber
                    }
                },
                ...TOKEN_DELEGATEES_FIELDS
            },
            stakedEcoXCurrentTokenDelegatees: {
                __aliasFor: 'tokenDelegatees',
                __args: {
                    where: {
                        ...baseFilter,
                        token: 'sEcox',
                        blockEnded: null
                    }
                },
                ...TOKEN_DELEGATEES_FIELDS
            }
        },
        inflationMultipliers: {
            __args: {
                first: 1,
                orderBy: 'blockNumber',
                orderDirection: 'desc',
                where: { blockNumber_lte: blockNumber }
            },
            value: true
        }
    };
    const subgraphUrl = ECO_SUBGRAPH_BY_CHAIN_ID[network];
    if (subgraphUrl == undefined) {
        throw new Error(`Unsupported network with id: ${network}`);
    }
    const { account: account, inflationMultipliers } = await (0, utils_1.subgraphRequest)(subgraphUrl, query);
    if (!account) {
        return Object.fromEntries(_addresses.map((address) => [(0, address_1.getAddress)(address), 0]));
    }
    const inflationMultiplier = inflationMultipliers.length
        ? bignumber_1.BigNumber.from(inflationMultipliers[0].value)
        : constants_1.WeiPerEther;
    const ecoHistoricalDelegations = createDelegationList(account.ecoTokenDelegatees, inflationMultiplier);
    const ecoCurrentDelegations = createDelegationList(account.ecoCurrentTokenDelegatees, inflationMultiplier);
    const stakedEcoXHistoricalDelegations = createDelegationList(account.stakedEcoXTokenDelegatees);
    const stakedEcoXCurrentDelegations = createDelegationList(account.stakedEcoXCurrentTokenDelegatees);
    return Object.fromEntries(_addresses.map((address) => {
        const ecoHistorical = ecoHistoricalDelegations[address] || constants_1.Zero;
        const ecoCurrent = ecoCurrentDelegations[address] || constants_1.Zero;
        const stakedEcoXHistorical = stakedEcoXHistoricalDelegations[address] || constants_1.Zero;
        const stakedEcoXCurrent = stakedEcoXCurrentDelegations[address] || constants_1.Zero;
        return [
            (0, address_1.getAddress)(address),
            parseInt((0, units_1.formatEther)(calculateVotingPower(ecoHistorical.add(ecoCurrent), stakedEcoXHistorical.add(stakedEcoXCurrent))))
        ];
    }));
}
exports.strategy = strategy;
