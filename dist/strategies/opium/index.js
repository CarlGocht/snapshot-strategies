"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'alirun';
exports.version = '0.0.1';
const DECIMALS = 18;
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
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
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Fetch OPIUM Balance
    const opiumQuery = addresses.map((address) => [
        options.OPIUM,
        'balanceOf',
        [address]
    ]);
    // Fetch wOPIUM Balance
    const wOpiumQuery = addresses.map((address) => [
        options.wOPIUM,
        'balanceOf',
        [address]
    ]);
    // Fetch 1inch LP token OPIUM-ETH balance
    const lp1inchOpiumEthQuery = addresses.map((address) => [
        options.LP_1INCH_OPIUM_ETH,
        'balanceOf',
        [address]
    ]);
    // Fetch Farming 1inch LP token OPIUM-ETH balance
    const farmingLp1inchOpiumEthQuery = addresses.map((address) => [
        options.FARMING_LP_1INCH_OPIUM_ETH,
        'balanceOf',
        [address]
    ]);
    const response = await (0, utils_1.multicall)(network, provider, abi, [
        // Get 1inch LP OPIUM-ETH balance of OPIUM
        [options.OPIUM, 'balanceOf', [options.LP_1INCH_OPIUM_ETH]],
        // Get total supply of 1inch LP OPIUM-ETH
        [options.LP_1INCH_OPIUM_ETH, 'totalSupply'],
        ...opiumQuery,
        ...wOpiumQuery,
        ...lp1inchOpiumEthQuery,
        ...farmingLp1inchOpiumEthQuery
    ], { blockTag });
    const opiumLp1inchOpiumEth = response[0];
    const opiumLp1inchOpiumEthTotalSupply = response[1];
    const responseClean = response.slice(2, response.length);
    const chunks = chunk(responseClean, addresses.length);
    const opiumBalances = chunks[0];
    const wOpiumBalances = chunks[1];
    const lp1inchOpiumEthBalances = chunks[2];
    const farmingLp1inchOpiumEthBalances = chunks[3];
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(
        // OPIUM
        opiumBalances[i][0]
            // wOPIUM
            .add(wOpiumBalances[i][0])
            // LP 1inch OPIUM-ETH + farming
            .add(opiumLp1inchOpiumEth[0]
            .mul(lp1inchOpiumEthBalances[i][0].add(farmingLp1inchOpiumEthBalances[i][0]))
            .div(opiumLp1inchOpiumEthTotalSupply[0]))
            .toString(), DECIMALS))
    ]));
}
exports.strategy = strategy;
