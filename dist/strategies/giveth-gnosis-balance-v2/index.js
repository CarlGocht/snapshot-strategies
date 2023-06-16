"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
exports.author = 'mateodaza';
exports.version = '0.1.0';
const GIVETH_SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/giveth/giveth-economy-second-xdai';
const XDAI_BLOCKS_API = 'https://api.thegraph.com/subgraphs/name/elkfinance/xdai-blocks';
const blockParams = {
    blocks: {
        __args: {
            first: 1,
            orderBy: 'timestamp',
            orderDirection: 'desc',
            where: {
                timestamp_lte: ''
            }
        },
        number: true
    }
};
const pairParams = {
    pair: {
        __args: {
            id: ''
        },
        reserve0: true,
        totalSupply: true
    }
};
const params = {
    tokenBalances: {
        __args: {
            orderBy: 'id',
            orderDirection: 'asc',
            where: {
                user_in: []
            }
        },
        id: true,
        balance: true,
        token: true
    }
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const block = await provider.getBlock(blockTag);
    blockParams.blocks.__args.where.timestamp_lte = block.timestamp;
    const xDaiBlock = await (0, utils_1.subgraphRequest)(XDAI_BLOCKS_API, blockParams);
    const blockNumber = Number(xDaiBlock.blocks[0].number);
    // @ts-ignore
    params.tokenBalances.__args.block = { number: blockNumber };
    if (snapshot !== 'latest') {
        // @ts-ignore
        pairParams.pair.__args.block = { number: blockNumber };
    }
    params.tokenBalances.__args.where.user_in = addresses.map((address) => address.toLowerCase());
    const data = await (0, utils_1.subgraphRequest)(GIVETH_SUBGRAPH_API, params);
    const score = {};
    data.tokenBalances.map((addressBalance) => {
        const id = addressBalance.id.split('-')[1];
        const prevScore = score[(0, address_1.getAddress)(id)] ? score[(0, address_1.getAddress)(id)] : 0;
        score[(0, address_1.getAddress)(id)] =
            prevScore +
                parseFloat((0, units_1.formatUnits)(addressBalance.balance, options.decimals));
    });
    return score;
}
exports.strategy = strategy;
