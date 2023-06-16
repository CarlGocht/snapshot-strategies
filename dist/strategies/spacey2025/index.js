"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'chuang39';
exports.version = '0.1.0';
const SPACEY2025_MARKETPLACE_SUBGRAPH_URL = {
    '56': 'https://api.thegraph.com/subgraphs/name/blockfishio/marketplacebsc'
};
var Category;
(function (Category) {
    Category["LAND"] = "land";
    Category["BOARDINGPASS"] = "boardingpass";
    Category["BUILDING"] = "building";
    Category["TOWER"] = "tower";
    Category["TRAP"] = "trap";
})(Category || (Category = {}));
async function strategy(space, network, provider, addresses, options, snapshot) {
    const params = {
        nfts: {
            __args: {
                where: {
                    owner_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000,
                skip: 0
            },
            owner: {
                id: true
            },
            category: {}
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.nfts.__args.block = { number: snapshot };
    }
    const score = {};
    let hasNext = true;
    while (hasNext) {
        const result = await (0, utils_1.subgraphRequest)(SPACEY2025_MARKETPLACE_SUBGRAPH_URL[network], params);
        const nfts = result && result.nfts ? result.nfts : [];
        for (const nft of nfts) {
            let vp = 0;
            switch (nft.category) {
                case Category.TOWER:
                case Category.BUILDING:
                case Category.TRAP:
                    vp += 6;
                    break;
                case Category.BOARDINGPASS:
                    vp += 1500;
                    break;
                case Category.LAND:
                    vp += 600;
                    break;
                default:
                    break;
            }
            const userAddress = (0, address_1.getAddress)(nft.owner.id);
            score[userAddress] = (score[userAddress] || 0) + vp;
        }
        params.nfts.__args.skip += params.nfts.__args.first;
        hasNext = nfts.length === params.nfts.__args.first;
    }
    return score;
}
exports.strategy = strategy;
