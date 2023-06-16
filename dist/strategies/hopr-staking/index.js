"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'QYuQianchen';
exports.version = '0.1.0';
const XDAI_BLOCK_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks';
const HOPR_STAKING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-staking-program';
const LIMIT = 1000; // 1000 addresses per query in Subgraph
async function getXdaiBlockNumber(timestamp) {
    const query = {
        blocks: {
            __args: {
                first: 1,
                orderBy: 'number',
                orderDirection: 'desc',
                where: {
                    timestamp_lte: timestamp
                }
            },
            number: true,
            timestamp: true
        }
    };
    const data = await (0, utils_1.subgraphRequest)(XDAI_BLOCK_SUBGRAPH_URL, query);
    return Number(data.blocks[0].number);
}
async function stakingSubgraphQuery(addresses, blockNumber) {
    const query = {
        accounts: {
            __args: {
                first: LIMIT,
                block: {
                    number: blockNumber
                },
                where: {
                    id_in: addresses.map((adr) => adr.toLowerCase())
                }
            },
            id: true,
            actualStake: true,
            virtualStake: true,
            unclaimedRewards: true
        }
    };
    const data = await (0, utils_1.subgraphRequest)(HOPR_STAKING_SUBGRAPH_URL, query);
    // map result (data.accounts) to addresses
    const entries = data.accounts.map((d) => [
        d.id,
        bignumber_1.BigNumber.from(d.actualStake).add(bignumber_1.BigNumber.from(d.virtualStake).add(bignumber_1.BigNumber.from(d.unclaimedRewards)))
    ]);
    return Object.fromEntries(entries);
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const isXdai = network === '100'; // either xDAI or ETH mainnet
    const [block] = await Promise.all([provider.getBlock(blockTag)]);
    // get the block number for subgraph query
    const subgraphBlock = isXdai
        ? block.number
        : await getXdaiBlockNumber(block.timestamp);
    // trim addresses to sub of "LIMIT" addresses.
    const addressSubsets = Array.apply(null, Array(Math.ceil(addresses.length / LIMIT))).map((_e, i) => addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const returnedFromSubgraph = await Promise.all(addressSubsets.map((subset) => stakingSubgraphQuery(subset, subgraphBlock)));
    // get and parse balance from subgraph
    const subgraphBalance = Object.assign({}, ...returnedFromSubgraph);
    const subgraphScore = addresses.map((address) => subgraphBalance[address.toLowerCase()] ?? 0);
    return Object.fromEntries(addresses.map((adr, i) => [
        adr,
        parseFloat((0, units_1.formatUnits)(subgraphScore[i], 18)) // subgraph balance
    ]));
}
exports.strategy = strategy;
