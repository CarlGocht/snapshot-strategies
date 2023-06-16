"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
exports.author = 'franckc';
exports.version = '0.2.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
// Number of blocks in 30 days, assuming 15 sec per block.
const numBlock30Days = (30 * 24 * 60 * 60) / 15;
async function strategy(space, network, provider, addresses, options, snapshot) {
    // If a specific block number is specified, use that.
    // Otherwise fetch the current block number from the network.
    const blockTag1 = typeof snapshot === 'number' ? snapshot : await (0, utils_1.getBlockNumber)(provider);
    const blockTag2 = blockTag1 - numBlock30Days;
    // Compile a list of calls to make against the OGN and staking contracts.
    const ognCalls = addresses.map((address) => [
        options.ognAddress,
        'balanceOf',
        [address]
    ]);
    const stakingCalls = addresses.map((address) => [
        options.seriesAddress,
        'balanceOf',
        [address]
    ]);
    // Make calls to the OGN and staking contract to fetch balances.
    const multicalls = [
        (0, utils_2.multicall)(network, provider, abi, ognCalls, { blockTag: blockTag1 }),
        (0, utils_2.multicall)(network, provider, abi, ognCalls, { blockTag: blockTag2 }),
        (0, utils_2.multicall)(network, provider, abi, stakingCalls, { blockTag: blockTag1 }),
        (0, utils_2.multicall)(network, provider, abi, stakingCalls, { blockTag: blockTag2 })
    ];
    const responses = await Promise.all(multicalls);
    // Compute an average score.
    const scores = {};
    addresses.forEach((address, i) => {
        const balance = responses[0][i][0]
            .add(responses[1][i][0])
            .add(responses[2][i][0])
            .add(responses[3][i][0])
            .div(2);
        scores[address] = parseFloat((0, units_1.formatUnits)(balance.toString(), options.decimals));
    });
    return scores;
}
exports.strategy = strategy;
