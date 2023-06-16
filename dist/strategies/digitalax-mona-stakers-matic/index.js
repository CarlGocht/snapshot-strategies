"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.ETH_IN_WEI = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require('@ethersproject/bignumber');
const bn = (num) => {
    return bignumber_1.BigNumber.from(num.toString());
};
exports.author = 'onigiri-x';
exports.version = '0.1.0';
const abiStaking = [
    'function getStakedBalance(address _user) external view returns (uint256)'
];
const STAKING_ADDRESS = '0xF795c2abB0E7A56A0C011993C37A51626756B4BD';
exports.ETH_IN_WEI = 1000000000000000000;
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakeResponse = await (0, utils_1.multicall)(network, _provider, abiStaking, addresses.map((address) => [
        STAKING_ADDRESS.toLowerCase(),
        'getStakedBalance',
        [address]
    ]), { blockTag });
    // The score is LP staking contract uniswap MONA value * (user LP staked / total LP staked)
    return Object.fromEntries(stakeResponse.map((value, i) => [
        addresses[i],
        parseFloat(bn(value)) / exports.ETH_IN_WEI
    ]));
}
exports.strategy = strategy;
