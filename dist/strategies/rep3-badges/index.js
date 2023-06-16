"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const console_1 = require("console");
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const utils_2 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'eth-jashan';
exports.version = '1.0.0';
const REP3_SUBGRAPH_API_URLS_BY_CHAIN_ID = {
    '80001': 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    '137': 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic'
};
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
// subgraph helper function to get Membership Badges
function fetchMembershipsForAddress(network, contractAddress, blockTag) {
    const url = REP3_SUBGRAPH_API_URLS_BY_CHAIN_ID[network];
    if (url == undefined) {
        throw new console_1.error(`Unsupported network with id: ${network}`);
    }
    const query = {
        membershipNFTs: {
            __args: {
                where: {
                    contractAddress: contractAddress
                },
                block: blockTag != 'latest' ? { number: blockTag } : null
            },
            time: true,
            level: true,
            tokenID: true,
            claimer: true
        }
    };
    return (0, utils_1.subgraphRequest)(url, query);
}
// subgraph helper function to get Association Badges
function fetchAssociationBadgesForAddress(network, contractAddress, blockTag) {
    const url = REP3_SUBGRAPH_API_URLS_BY_CHAIN_ID[network];
    if (url == undefined) {
        throw new console_1.error(`Unsupported network with id: ${network}`);
    }
    const query = {
        associationBadges: {
            __args: {
                where: {
                    contractAddress: contractAddress
                },
                block: blockTag != 'latest' ? { number: blockTag } : null
            },
            type: true,
            tokenID: true,
            claimer: true
        }
    };
    return (0, utils_1.subgraphRequest)(url, query);
}
// Combining ERC20 Balances and Weights from Rep3 Badges
function applyBadgeWeights(badges, erc20Balance, options) {
    const badgeWeights = {};
    badges.forEach((badge) => {
        if (badge?.level) {
            const levelWeight = options.specs.find((spec) => spec.level === parseInt(badge?.level));
            if (badgeWeights[(0, address_1.getAddress)(badge.claimer)]) {
                badgeWeights[(0, address_1.getAddress)(badge.claimer)] =
                    badgeWeights[(0, address_1.getAddress)(badge.claimer)] + levelWeight.weight;
            }
            else {
                badgeWeights[(0, address_1.getAddress)(badge.claimer)] = levelWeight.weight;
            }
        }
        else if (badge?.type) {
            const levelWeight = options.specs.find((spec) => spec.type === parseInt(badge?.type));
            if (badgeWeights[(0, address_1.getAddress)(badge.claimer)]) {
                badgeWeights[(0, address_1.getAddress)(badge.claimer)] =
                    badgeWeights[(0, address_1.getAddress)(badge.claimer)] + levelWeight.weight;
            }
            else {
                badgeWeights[(0, address_1.getAddress)(badge.claimer)] = levelWeight.weight;
            }
        }
    });
    if (options?.erc20Token) {
        Object.keys(erc20Balance).forEach((key) => {
            if (badgeWeights[key]) {
                if (erc20Balance[key]) {
                    erc20Balance[key] = erc20Balance[key] * badgeWeights[key];
                }
                else {
                    erc20Balance[key] = badgeWeights[key];
                }
            }
        });
    }
    return options?.erc20Token ? erc20Balance : badgeWeights;
}
// helper function to get ERC20 balances for addresses
async function getErc20Balance(network, provider, abi, blockTag, addresses, options) {
    if (options.erc20Token) {
        const multi = new utils_2.Multicaller(network, provider, abi, { blockTag });
        addresses.forEach((address) => multi.call(address, options.erc20Token, 'balanceOf', [address]));
        try {
            const result = await multi.execute();
            Object.keys(result).forEach((key) => {
                result[key] = parseFloat((0, units_1.formatUnits)(result[key], options.erc20Decimal));
            });
            return result;
        }
        catch (error) {
            return {};
        }
    }
    else {
        return {};
    }
}
async function strategy(space, network, provider, addresses, options, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const erc20BalanceOf = await getErc20Balance(network, provider, abi, blockTag, addresses, options);
    let associationBadges = [];
    const allMembershipbadges = await fetchMembershipsForAddress(options.subgraphNetwork, options.rep3ContractAddress, 'latest');
    const allAssociationBadges = await fetchAssociationBadgesForAddress(options.subgraphNetwork, options.rep3ContractAddress, 'latest');
    const validMembershipNft = addresses.map((address) => {
        const membershipNftForAddress = allMembershipbadges.membershipNFTs.filter((x) => (0, address_1.getAddress)(x.claimer) === address);
        const associationBadgeForAddress = allAssociationBadges.associationBadges.filter((x) => (0, address_1.getAddress)(x.claimer) === address);
        if (associationBadgeForAddress.length > 0) {
            associationBadges = associationBadges.concat(associationBadgeForAddress);
        }
        if (membershipNftForAddress.length > 1) {
            const latestMembership = allMembershipbadges.membershipNFTs.sort((p1, p2) => (p1.time < p2.time ? 1 : p1.time > p2.time ? -1 : 0));
            return latestMembership[0];
        }
        else if (membershipNftForAddress.length === 1) {
            return membershipNftForAddress[0];
        }
    });
    let allWeightableBadges = validMembershipNft.concat(associationBadges);
    allWeightableBadges = allWeightableBadges.filter((x) => x !== undefined);
    let badgeWeights = {};
    if (!allWeightableBadges)
        return badgeWeights;
    badgeWeights = applyBadgeWeights(allWeightableBadges, erc20BalanceOf, options);
    return Object.fromEntries(addresses.map((address) => [address, badgeWeights[address] || 0]));
}
exports.strategy = strategy;
