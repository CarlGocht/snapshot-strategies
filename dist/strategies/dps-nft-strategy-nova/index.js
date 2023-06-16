"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'andreibadea20';
exports.version = '0.1.0';
const DPS_SUBGRAPH_URL_NOVA = {
    '42170': 'https://api.goldsky.com/api/public/project_clg4w9cwqdk8c3rz73mqr0z91/subgraphs/voting-subgraph/1.0.0/gn'
};
const PAGE_SIZE = 1000;
const params_nova = {
    holders: {
        __args: {
            block: { number: 927357 },
            first: PAGE_SIZE,
            skip: 0
        },
        id: true,
        numberOfDPSOwned: true,
        listOfDPSLocked: {
            tokenId: true
        },
        listOfDPSReturned: {
            tokenId: true
        }
    }
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    //calculate score for moonbeam
    const score = {};
    // calculate score for nova
    if (snapshot !== 'latest') {
        // @ts-ignore
        params_nova.holders.__args.block = { number: snapshot };
    }
    // eslint-disable-next-line prefer-const
    let page_nova = 0;
    while (page_nova !== -1) {
        params_nova.holders.__args.skip = page_nova * PAGE_SIZE;
        const result = await (0, utils_1.subgraphRequest)(DPS_SUBGRAPH_URL_NOVA[network], params_nova);
        if (result && result.holders) {
            result.holders.forEach((holder) => {
                const userAddress = (0, address_1.getAddress)(holder.id);
                let userScore = Number(holder.numberOfDPSOwned);
                const lockedNFTs = holder.listOfDPSLocked.length;
                const claimedNFTs = holder.listOfDPSReturned.length;
                userScore = userScore + lockedNFTs - claimedNFTs;
                if (!score[userAddress])
                    score[userAddress] = 0;
                score[userAddress] = userScore;
            });
            page_nova = result.holders.length < PAGE_SIZE ? -1 : page_nova + 1;
        }
        else {
            page_nova = -1;
        }
    }
    return score || {};
}
exports.strategy = strategy;
