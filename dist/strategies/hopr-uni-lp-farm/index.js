"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'hoprnet';
exports.version = '0.1.0';
const tokenAndPoolAbi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'liquidityProviders',
        outputs: [
            {
                internalType: 'uint256',
                name: 'claimedUntil',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'currentBalance',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
const XDAI_BLOCK_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks';
const HOPR_XDAI_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hoprnet/hopr-on-xdai';
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
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const [res, block] = await Promise.all([
        (0, utils_1.multicall)(network, provider, tokenAndPoolAbi, [
            [options.hoprAddress, 'balanceOf', [options.uniPoolAddress]],
            [options.uniPoolAddress, 'totalSupply', []]
        ]
            .concat(addresses.map((address) => [
            options.uniPoolAddress,
            'balanceOf',
            [address]
        ]))
            .concat(blockTag >= options.farmDeployBlock || blockTag === 'latest'
            ? addresses.map((address) => [
                options.farmAddress,
                'liquidityProviders',
                [address]
            ])
            : []), { blockTag }),
        provider.getBlock(blockTag)
    ]);
    const hoprBalanceOfPool = res[0];
    const poolTotalSupply = res[1];
    const response = blockTag >= options.farmDeployBlock || blockTag === 'latest'
        ? res
            .slice(2, 2 + addresses.length)
            .map((r, i) => r[0].add(res[2 + i + addresses.length][1]))
        : res.slice(2).map((r) => r[0]);
    // get block timestamp to search on xDai subgraph
    const snapshotXdaiBlock = await getXdaiBlockNumber(block.timestamp);
    // trim addresses to sub of "LIMIT" addresses.
    const addressSubsets = Array.apply(null, Array(Math.ceil(addresses.length / LIMIT))).map((_e, i) => addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const returnedFromSubgraph = await Promise.all(addressSubsets.map((subset) => xHoprSubgraphQuery(subset, snapshotXdaiBlock)));
    // get and parse xHOPR and wxHOPR balance
    const hoprOnXdaiBalance = Object.assign({}, ...returnedFromSubgraph);
    const hoprOnXdaiScore = addresses.map((address) => hoprOnXdaiBalance[address.toLowerCase()] ?? 0);
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.mul(hoprBalanceOfPool[0]).div(poolTotalSupply[0]), 18)) + hoprOnXdaiScore[i] // xHOPR + wxHOPR balance
    ]));
}
exports.strategy = strategy;
