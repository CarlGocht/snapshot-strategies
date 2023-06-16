"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'JDoy99';
exports.version = '0.1.0';
const erc20Abi = [
    'function balanceOf(address owner) external returns (uint256)'
];
const lpTokenAbi = [
    'function getReserves() view returns (uint112, uint112, uint32)',
    'function token0() view returns (address)',
    'function totalSupply() view returns (uint256)'
];
const mfdAbi = [
    'function lockedBalances(address) view returns (uint256, uint256, uint256, uint256, tuple(uint256,uint256,uint256,uint256)[])'
];
const balancerVaultAbi = [
    'function getPoolTokenInfo(bytes32,address) view returns (uint256)'
];
const toJsNum = (bn) => {
    return parseFloat((0, units_1.formatUnits)(bn));
};
const rdntPerBalancerLpToken = async (network, provider, options, blockTag) => {
    const rdntInVault = await (0, utils_1.call)(provider, balancerVaultAbi, [
        options.balancerVault,
        'getPoolTokenInfo',
        [options.balancerPoolId, options.rdnt],
        { blockTag }
    ]);
    const rdntInLp = toJsNum(rdntInVault);
    const [totalSupplyBn] = await (0, utils_1.multicall)(network, provider, lpTokenAbi, [[options.lpToken, 'totalSupply']], { blockTag });
    const totalSupply = toJsNum(totalSupplyBn[0]);
    return rdntInLp / totalSupply;
};
const rdntPerUniLpToken = async (network, provider, options, blockTag) => {
    const [totalSupplyBn, token0s, reserves] = await (0, utils_1.multicall)(network, provider, lpTokenAbi, [
        [options.lpToken, 'totalSupply'],
        [options.lpToken, 'token0'],
        [options.lpToken, 'getReserves']
    ], { blockTag });
    const totalSupply = toJsNum(totalSupplyBn[0]);
    const [reserve0, reserve1] = reserves;
    const [token0] = token0s;
    let rdntInLp;
    if (token0.toLowerCase() === options.rdnt.toLowerCase()) {
        rdntInLp = toJsNum(reserve0);
    }
    else {
        rdntInLp = toJsNum(reserve1);
    }
    return rdntInLp / totalSupply;
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Get RDNT per LP token (LP provider dependent)
    let rdntPerLp;
    if (network === '42161') {
        rdntPerLp = await rdntPerBalancerLpToken(network, provider, options, blockTag);
    }
    else if (network === '56') {
        rdntPerLp = await rdntPerUniLpToken(network, provider, options, blockTag);
    }
    // console.log(`RDNT per LP token: ${rdntPerLp}`);
    // Get non-locked LP balances
    const lpBalanceMulticall = new utils_1.Multicaller(network, provider, erc20Abi, {
        blockTag
    });
    addresses.forEach((address) => lpBalanceMulticall.call(address, options.lpToken, 'balanceOf', [address]));
    const lpBalances = await lpBalanceMulticall.execute();
    // Get locked LP balances
    const mfdMulticall = new utils_1.Multicaller(network, provider, mfdAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        mfdMulticall.call(address, options.lockingContract, 'lockedBalances', [
            address
        ]);
    });
    const lockedBalances = await mfdMulticall.execute();
    // Combined locked & unlocked LP balances for all users
    // TODO: better way of handling this accumulation w/ new typed result obj
    Object.keys(lockedBalances).forEach(function (key) {
        if (lpBalances.hasOwnProperty(key)) {
            lpBalances[key] =
                toJsNum(lpBalances[key]) + toJsNum(lockedBalances[key][2]);
        }
        else {
            lpBalances[key] = toJsNum(lockedBalances[key][2]);
        }
    });
    // User's total LP balance * RDNT per LP token => total RDNT in their LP positions
    return Object.fromEntries(Object.entries(lpBalances).map(([address, balance]) => [
        address,
        balance * rdntPerLp
    ]));
}
exports.strategy = strategy;
