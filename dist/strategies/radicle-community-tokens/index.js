"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const FUNDING_SUBGRAPH_URL = {
    '4': 'https://api.studio.thegraph.com/query/9578/funding-subgraph-v5/v0.0.1' // Rinkeby testnet
};
exports.author = 'AmirSarraf';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    let params = {};
    const fundingProject = options.fundingProject;
    const mainField = fundingProject ? 'fundingProjects' : 'nfts';
    if (fundingProject) {
        // parameters to query nfts belonging to the provided addresses in a certain fundingProject
        params = {
            fundingProjects: {
                __args: {
                    id: fundingProject.toLowerCase()
                },
                id: true,
                nfts: {
                    __args: {
                        where: {
                            nftReceiver_in: addresses.map((address) => address.toLowerCase())
                        }
                    },
                    amtPerSec: true,
                    nftReceiver: true
                }
            }
        };
    }
    else {
        // parameters to query nfts belonging to the provided addresses
        params = {
            nfts: {
                __args: {
                    where: {
                        nftReceiver_in: addresses.map((address) => address.toLowerCase())
                    },
                    first: 1000
                },
                amtPerSec: true,
                nftReceiver: true
            }
        };
    }
    if (snapshot !== 'latest') {
        // @ts-ignore
        params[mainField].__args.block = { number: snapshot };
    }
    let result = await (0, utils_1.subgraphRequest)(FUNDING_SUBGRAPH_URL[network], params);
    result = fundingProject
        ? result?.fundingProjects?.find((proj) => proj.id == fundingProject) //double checking id
        : result;
    const score = {};
    if (result && result.nfts) {
        result.nfts.forEach((nft) => {
            const userAddress = (0, address_1.getAddress)(nft.nftReceiver);
            const userScore = nft.amtPerSec;
            if (!score[userAddress])
                score[userAddress] = bignumber_1.BigNumber.from(0);
            score[userAddress] = score[userAddress].add(bignumber_1.BigNumber.from(userScore));
        });
    }
    return Object.fromEntries(Object.entries(score).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
