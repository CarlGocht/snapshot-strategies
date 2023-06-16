"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'fsjuhl';
exports.version = '0.1.0';
const stakingAbi = [
    'function getVampsBuried(address burier) view returns (uint256[])'
];
const tokenAbi = ['function balanceOf(address owner) view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakersResponse = await (0, utils_1.multicall)(network, provider, stakingAbi, addresses.map((address) => [
        options.stakingAddress,
        'getVampsBuried',
        [address]
    ]), { blockTag });
    const holdersResponse = await (0, utils_1.multicall)(network, provider, tokenAbi, addresses.map((address) => [
        options.tokenAddress,
        'balanceOf',
        [address]
    ]), { blockTag });
    return Object.fromEntries(stakersResponse.map((value, i) => [
        addresses[i],
        value[0].length +
            parseFloat((0, units_1.formatUnits)(holdersResponse[i][0].toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
