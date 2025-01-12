"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'dogsunchained';
exports.version = '0.1.1';
const abi721or20 = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/dogsunchained/dogs-unchained';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const NFT_VALUE = 1;
    const calls721 = [];
    const calls20 = [];
    addresses.forEach((address) => {
        calls721.push([options.steaks, 'balanceOf', [address]]);
        calls20.push([options.boom, 'balanceOf', [address]]);
    });
    calls721.push([options.steaks, 'totalSupply', []]);
    calls20.push([options.boom, 'totalSupply', []]);
    const response721 = await (0, utils_1.multicall)(network, provider, abi721or20, calls721, {
        blockTag
    });
    const response20 = await (0, utils_1.multicall)(network, provider, abi721or20, calls20, {
        blockTag
    });
    let totalNFTs = parseInt(response721.pop().toString()) * NFT_VALUE;
    const totalBOOM = parseFloat((0, units_1.formatUnits)(response20.pop().toString(), 18));
    const paginate = (skip, reverse = false, where = {}) => {
        const req = {
            __args: {
                first: 1000,
                skip,
                orderBy: 'id',
                orderDirection: reverse ? 'desc' : 'asc',
                where: where
            },
            id: true,
            owner: {
                id: true
            }
        };
        if (typeof snapshot === 'number')
            req.__args['block'] = { number: snapshot };
        return req;
    };
    const dogParams = {
        'd1:dogs': paginate(0, false, { burned: false }),
        'd2:dogs': paginate(1000, false, { burned: false }),
        'd3:dogs': paginate(2000, false, { burned: false }),
        'd4:dogs': paginate(3000, false, { burned: false }),
        'd5:dogs': paginate(4000, false, { burned: false }),
        'd6:dogs': paginate(5000, false, { burned: false })
    };
    const dogsResult = await (0, utils_1.subgraphRequest)(SUBGRAPH_URL, dogParams);
    const puppyParams = {
        'p1:puppies': paginate(0),
        'p2:puppies': paginate(1000),
        'p3:puppies': paginate(2000),
        'p4:puppies': paginate(3000),
        'p5:puppies': paginate(4000),
        'p6:puppies': paginate(5000)
    };
    const puppiesResult = await (0, utils_1.subgraphRequest)(SUBGRAPH_URL, puppyParams);
    const stakeParams = {
        'p1:stakes': paginate(0),
        'p2:stakes': paginate(1000)
    };
    const stakesResult = await (0, utils_1.subgraphRequest)(SUBGRAPH_URL, stakeParams);
    const merged = {};
    response721.map((value, i) => {
        const address = (0, address_1.getAddress)(calls721[i][2][0]);
        if (address == options.staking)
            return;
        merged[address] = (merged[address] || 0);
        merged[address] += parseFloat((0, units_1.formatUnits)(value.toString(), 0)) * NFT_VALUE;
    });
    for (const key in dogsResult) {
        dogsResult[key].map((value) => {
            if (!value.owner)
                return;
            const address = (0, address_1.getAddress)(value.owner.id);
            merged[address] = (merged[address] || 0);
            merged[address] += NFT_VALUE;
            totalNFTs += NFT_VALUE;
        });
    }
    for (const key in puppiesResult) {
        puppiesResult[key].map((value) => {
            if (!value.owner)
                return;
            const address = (0, address_1.getAddress)(value.owner.id);
            merged[address] = (merged[address] || 0);
            merged[address] += NFT_VALUE;
            totalNFTs += NFT_VALUE;
        });
    }
    for (const key in stakesResult) {
        stakesResult[key].map((value) => {
            if (!value.owner)
                return;
            const address = (0, address_1.getAddress)(value.owner.id);
            merged[address] = (merged[address] || 0);
            merged[address] += NFT_VALUE;
        });
    }
    const BOOM_TO_NFT = totalNFTs / totalBOOM;
    response20.map((value, i) => {
        const address = (0, address_1.getAddress)(calls20[i][2][0]);
        merged[address] = (merged[address] || 0);
        merged[address] +=
            parseFloat((0, units_1.formatUnits)(value.toString(), 18)) * BOOM_TO_NFT;
    });
    return merged;
}
exports.strategy = strategy;
