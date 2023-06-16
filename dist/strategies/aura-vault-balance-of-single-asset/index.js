"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'chuddster';
exports.version = '0.1.0';
const BALANCER_VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const abi = [
    'function asset() external view returns (address)',
    'function getPoolId() external view returns (bytes32)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function getPoolTokens(bytes32 poolId) external view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('bptAsset', options.auraVaultDeposit, 'asset', []);
    const bptAssetResult = await multi.execute();
    multi.call('poolId', bptAssetResult.bptAsset, 'getPoolId', []);
    const poolIdResult = await multi.execute();
    multi.call('underlyingBalance', BALANCER_VAULT, 'getPoolTokens', [
        poolIdResult.poolId
    ]);
    const underlyingBalanceResult = await multi.execute();
    const underlyingBalance = underlyingBalanceResult.underlyingBalance.balances[parseInt(options.tokenIndex)];
    multi.call('bptTotalSupply', bptAssetResult.bptAsset, 'totalSupply', []);
    const bptTotalSupply = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.auraVaultDeposit, 'balanceOf', [address]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance.mul(underlyingBalance).div(bptTotalSupply.bptTotalSupply), parseInt(options.decimals)))
    ]));
}
exports.strategy = strategy;
