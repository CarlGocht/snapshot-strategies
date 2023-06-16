"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'andreibadea20';
exports.version = '0.3.1';
const DPS_SUBGRAPH_URL_MOONBEAM = {
    '1284': 'https://api.thegraph.com/subgraphs/name/andreibadea20/dps-holders-moonbeam'
};
const PAGE_SIZE = 1000;
const params = {
    holders: {
        __args: {
            block: { number: 2847359 },
            first: PAGE_SIZE,
            skip: 0
        },
        id: true,
        listOfDPSOwned: true,
        listOfDPSLocked: {
            tokenId: true
        },
        listOfDPSReturned: {
            tokenId: true
        }
    }
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.holders.__args.block = { number: snapshot };
    }
    const score = {};
    let page = 0;
    while (page !== -1) {
        params.holders.__args.skip = page * PAGE_SIZE;
        const result = await (0, utils_1.subgraphRequest)(DPS_SUBGRAPH_URL_MOONBEAM[network], params);
        if (result && result.holders) {
            result.holders.forEach((holder) => {
                const userAddress = (0, address_1.getAddress)(holder.id);
                let userScore = holder.listOfDPSOwned.length;
                const lockedNFTs = holder.listOfDPSLocked.length;
                const claimedNFTs = holder.listOfDPSReturned.length;
                userScore = userScore + lockedNFTs - claimedNFTs;
                if (!score[userAddress])
                    score[userAddress] = 0;
                score[userAddress] = 3 * userScore;
            });
            page = result.holders.length < PAGE_SIZE ? -1 : page + 1;
        }
        else {
            page = -1;
        }
    }
    return score || {};
}
exports.strategy = strategy;
