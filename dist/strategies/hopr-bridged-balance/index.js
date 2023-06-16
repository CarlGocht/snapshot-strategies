"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'QYuQianchen';
exports.version = '0.1.0';
const tokenAbi = ['function balanceOf(address) view returns (uint256)'];
const XDAI_BLOCK_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks';
const MAINNET_BLOCK_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';
const HOPR_XDAI_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-on-xdai';
const HOPR_MAINNET_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-on-mainnet';
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
async function getMainnetBlockNumber(timestamp) {
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
    const data = await (0, utils_1.subgraphRequest)(MAINNET_BLOCK_SUBGRAPH_URL, query);
    return Number(data.blocks[0].number);
}
async function xHoprSubgraphQuery(addresses, blockNumber) {
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
            totalBalance: true
        }
    };
    const data = await (0, utils_1.subgraphRequest)(HOPR_XDAI_SUBGRAPH_URL, query);
    // map result (data.accounts) to addresses
    const entries = data.accounts.map((d) => [d.id, Number(d.totalBalance)]);
    return Object.fromEntries(entries);
}
async function hoprSubgraphQuery(addresses, blockNumber) {
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
            amount: true
        }
    };
    const data = await (0, utils_1.subgraphRequest)(HOPR_MAINNET_SUBGRAPH_URL, query);
    // map result (data.accounts) to addresses
    const entries = data.accounts.map((d) => [d.id, Number(d.amount)]);
    return Object.fromEntries(entries);
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const isEth = network === '1'; // either ETH mainnet or xDAI
    const [res, block] = await Promise.all([
        (0, utils_1.multicall)(network, provider, tokenAbi, addresses
            .map((address) => [
            isEth ? options.hopr : options.xHopr,
            'balanceOf',
            [address]
        ])
            .concat(isEth
            ? []
            : addresses.map((address) => [
                options.wxHopr,
                'balanceOf',
                [address]
            ])), { blockTag }),
        provider.getBlock(blockTag)
    ]);
    const currentNetwork = isEth
        ? res.map((r) => r[0])
        : addresses.map((r, i) => res[i][0].add(res[i + addresses.length][0]));
    const subgraphBlock = isEth
        ? await getXdaiBlockNumber(block.timestamp)
        : await getMainnetBlockNumber(block.timestamp);
    // trim addresses to sub of "LIMIT" addresses.
    const addressSubsets = Array.apply(null, Array(Math.ceil(addresses.length / LIMIT))).map((_e, i) => addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const returnedFromSubgraph = isEth
        ? await Promise.all(addressSubsets.map((subset) => xHoprSubgraphQuery(subset, subgraphBlock)))
        : await Promise.all(addressSubsets.map((subset) => hoprSubgraphQuery(subset, subgraphBlock)));
    // get and parse balance from subgraph
    const subgraphBalance = Object.assign({}, ...returnedFromSubgraph);
    const subgraphScore = addresses.map((address) => subgraphBalance[address.toLowerCase()] ?? 0);
    return Object.fromEntries(currentNetwork.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value, 18)) + subgraphScore[i] // subgraph balance
    ]));
}
exports.strategy = strategy;
