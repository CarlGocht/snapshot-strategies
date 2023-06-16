"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const console_1 = require("console");
const utils_1 = require("../../utils");
exports.author = 'otterspace-xyz';
exports.version = '1.0.1';
const OTTERSPACE_SUBGRAPH_API_URLS_BY_CHAIN_ID = {
    '1': 'https://api.thegraph.com/subgraphs/name/otterspace-xyz/badges-mainnet',
    '5': 'https://api.thegraph.com/subgraphs/name/otterspace-xyz/badges-goerli',
    '10': 'https://api.thegraph.com/subgraphs/name/otterspace-xyz/badges-optimism-alpha',
    '420': 'https://api.thegraph.com/subgraphs/name/otterspace-xyz/badges-optimism-goerli',
    '137': 'https://api.thegraph.com/subgraphs/name/otterspace-xyz/badges-polygon'
};
function fetchBadgesForRaft(network, raftTokenId, specIds, blockTag) {
    const url = OTTERSPACE_SUBGRAPH_API_URLS_BY_CHAIN_ID[network];
    if (url == undefined) {
        throw new console_1.error(`Unsupported network with id: ${network}`);
    }
    const specFilter = {
        raft: `rafts:${raftTokenId}`
    };
    if (specIds && specIds.length > 0) {
        specFilter.id_in = specIds;
    }
    const query = {
        badges: {
            __args: {
                where: {
                    spec_: specFilter
                },
                block: blockTag != 'latest' ? { number: blockTag } : null
            },
            owner: {
                id: true
            },
            spec: {
                id: true
            }
        }
    };
    return (0, utils_1.subgraphRequest)(url, query);
}
function getBadgeWeight(specs, badgeSpecID) {
    let badgeWeight = 0;
    if (specs && specs.length > 0) {
        const specConfig = specs.find((spec) => spec.id === badgeSpecID);
        badgeWeight =
            specConfig &&
                isBadgeActive(specConfig.status, specConfig.metadata?.expiresAt || null)
                ? specConfig.weight
                : 0;
    }
    else {
        badgeWeight = 1;
    }
    return badgeWeight;
}
function isBadgeActive(status, expiresAt) {
    return !['REVOKED', 'BURNED'].includes(status) && expiresAt
        ? Date.now() - Number(new Date(expiresAt)) <= 0
        : true;
}
function applyBadgeWeights(badges, options) {
    const badgeWeights = {};
    badges.forEach((badge) => {
        const badgeAddress = badge.owner.id.toLowerCase();
        const badgeWeight = getBadgeWeight(options.specs, badge.spec.id);
        // picks the highest weight when multiple badges are held by the same address
        if (!badgeWeights[badgeAddress] ||
            badgeWeight > badgeWeights[badgeAddress]) {
            badgeWeights[badgeAddress] = badgeWeight;
        }
        else {
            return;
        }
    });
    return badgeWeights;
}
async function strategy(space, network, provider, addresses, options, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const getBadgesResponse = await fetchBadgesForRaft(network, options.raftTokenId, options.specs.map((spec) => spec.id), blockTag);
    let badgeWeights = {};
    const badges = getBadgesResponse?.badges;
    if (!badges)
        return badgeWeights;
    badgeWeights = applyBadgeWeights(badges, options);
    return Object.fromEntries(addresses.map((address) => [
        address,
        badgeWeights[address.toLowerCase()] || 0
    ]));
}
exports.strategy = strategy;
