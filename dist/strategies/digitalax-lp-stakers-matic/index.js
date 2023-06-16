"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require('@ethersproject/bignumber');
const quickswap_1 = require('../digitalax-mona-quickswap');
const bn = (num) => {
    return bignumber_1.BigNumber.from(num.toString());
};
exports.author = 'onigiri-x';
exports.version = '0.1.0';
const abiStaking = [
    'function getStakedLPBalance(address _user) external view returns (uint256)',
    'function stakedLPTotalForPool() public view returns (uint256)'
];
const STAKING_ADDRESS = '0xF795c2abB0E7A56A0C011993C37A51626756B4BD';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const totalPoolShares = await (0, utils_1.multicall)(network, _provider, abiStaking, [[STAKING_ADDRESS.toLowerCase(), 'stakedLPTotalForPool']], { blockTag });
    const totalStakedLP = bn(totalPoolShares[0]);
    const stakeResponse = await (0, utils_1.multicall)(network, _provider, abiStaking, addresses.map((address) => [
        STAKING_ADDRESS.toLowerCase(),
        'getStakedLPBalance',
        [address]
    ]), { blockTag });
    // Get just the LP MONA equivalent for just the LP Staking contract
    const uniswap = await quickswap_1.strategy(_space, network, _provider, [STAKING_ADDRESS], { strategyType: 'monausd', ...options }, snapshot);
    // The score is LP staking contract uniswap MONA value * (user LP staked / total LP staked)
    return Object.fromEntries(stakeResponse.map((value, i) => [
        addresses[i],
        (parseFloat(bn(value)) * uniswap[STAKING_ADDRESS]) /
            parseFloat(totalStakedLP)
    ]));
}
exports.strategy = strategy;
