"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'programmablewealth';
exports.version = '0.1.0';
const AAVEGOTCHI_SUBGRAPH_URL = {
    137: 'https://subgraph.satsuma-prod.com/tWYl5n5y04oz/aavegotchi/aavegotchi-core-matic/api'
};
const itemPriceParams = {
    itemTypes: {
        __args: {
            first: 1000
        },
        svgId: true,
        ghstPrice: true
    }
};
async function strategy(_space, network, provider, addresses) {
    const walletQueryParams = {
        users: {
            __args: {
                where: {
                    id_in: addresses.map((addr) => addr.toLowerCase())
                },
                first: 1000
            },
            id: true,
            gotchisOwned: {
                baseRarityScore: true,
                equippedWearables: true
            }
        }
    };
    const result = await (0, utils_1.subgraphRequest)(AAVEGOTCHI_SUBGRAPH_URL[network], {
        ...itemPriceParams,
        ...walletQueryParams
    });
    const prices = {};
    result.itemTypes.map((itemInfo) => {
        const itemValue = parseFloat((0, units_1.formatUnits)(itemInfo.ghstPrice, 18));
        if (itemValue > 0)
            prices[parseInt(itemInfo.svgId)] = itemValue;
    });
    const itemVotingPower = { '239': 100, '240': 100, '241': 100 };
    const walletScores = {};
    result.users.map((addrInfo) => {
        let gotchiWagieValue = 0;
        const { id, gotchisOwned } = addrInfo;
        if (gotchisOwned.length > 0)
            gotchisOwned.map((gotchi) => {
                gotchi.equippedWearables
                    .filter((itemId) => itemId == 239 || itemId == 240 || itemId == 241)
                    .map((itemId) => {
                    const votes = itemVotingPower[itemId.toString()];
                    gotchiWagieValue += votes;
                });
            });
        const addr = addresses.find((addrOption) => addrOption.toLowerCase() === id);
        walletScores[addr] = gotchiWagieValue;
    });
    addresses.map((addr) => {
        if (!walletScores[addr])
            walletScores[addr] = 0;
    });
    return walletScores;
}
exports.strategy = strategy;
