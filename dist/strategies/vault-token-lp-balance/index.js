"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'foxthefarmer';
exports.version = '0.0.1';
const vaultAbi = [
    'function poolInfo(uint256) returns (address want,uint256 allocPoint,uint256 lastRewardBlock,uint256 accAQUAPerShare,address strat)',
    'function stakedWantTokens(uint256 _pid, address _user) returns (uint256)'
];
const bep20Abi = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const erc20Multi = new utils_1.Multicaller(network, provider, bep20Abi, {
        blockTag
    });
    erc20Multi.call('lpTotalSupply', options.lpAddress, 'totalSupply');
    erc20Multi.call('lpTokenBalance', options.tokenAddress, 'balanceOf', [
        options.lpAddress
    ]);
    const erc20Result = await erc20Multi.execute();
    const tokenPerLp = parseFloat(erc20Result.lpTokenBalance.toString()) /
        parseFloat(erc20Result.lpTotalSupply.toString());
    const userVaultLpBalanceCalls = (0, utils_1.multicall)(network, provider, vaultAbi, addresses.map((address) => [
        options.vaultChefAddress,
        'stakedWantTokens',
        [options.pid, address]
    ]), { blockTag });
    const vaultBalances = await Promise.all([userVaultLpBalanceCalls]);
    return Object.fromEntries(Object.entries(addresses).map((address, index) => [
        address[1],
        parseFloat((0, units_1.formatUnits)(vaultBalances[0][index].toString(), 18)) *
            tokenPerLp
    ]));
}
exports.strategy = strategy;
