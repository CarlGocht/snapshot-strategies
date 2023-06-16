"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'd1ll0nk';
exports.version = '0.1.0';
const abi = [
    'function getMultipleVotesInclusive(address token, address[] accounts) external view returns (uint256[] scores)'
];
const CompLikeVotesInclusive = '0x95Cb39a64390994dd8C1cC5D8a29dFfDE4212298';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.call)(provider, abi, [
        CompLikeVotesInclusive,
        'getMultipleVotesInclusive',
        [options.address, addresses]
    ], { blockTag });
    return response.reduce((obj, value, i) => ({
        ...obj,
        [addresses[i]]: parseFloat((0, units_1.formatUnits)(value, options.decimals))
    }), {});
}
exports.strategy = strategy;
