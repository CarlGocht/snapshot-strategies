"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'dapplion';
exports.version = '0.1.0';
const contractAbi = [
    'function balanceOf(address account) view returns (uint256)',
    'function earned(address account) view returns (uint256)',
    'function totalSupply() public view returns (uint256)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    let res = await (0, utils_1.multicall)(network, provider, contractAbi, [
        [options.lpTokenAddress, 'totalSupply', []],
        [options.tokenAddress, 'balanceOf', [options.lpTokenAddress]],
        ...addresses.map((address) => [
            options.unipoolAddress,
            'balanceOf',
            [address]
        ]),
        ...addresses.map((address) => [
            options.unipoolAddress,
            'earned',
            [address]
        ])
    ], { blockTag });
    const lpTokenTotalSupply = bn(res[0]); // decimal: 18
    const totalTokensInPool = bn(res[1]); // decimal: options.decimal
    res = res.slice(2);
    // How much tokens user has from staked LP tokens
    const usersTokensFromLp = res.slice(0, addresses.length).map((num) => {
        const stakedLpTokens = bn(num); // decimal: 18
        // StakedLP x token.balanceOf(LPToken) / LPToken.totalSupply()
        return stakedLpTokens.mul(totalTokensInPool).div(lpTokenTotalSupply); // decimal: options.decimal
    });
    // How much rewarded tokens user have in the unipool contract
    const usersEarnedTokensList = res.slice(addresses.length).map((num) => {
        return bn(num); // decimal: options.decimal
    });
    const sumList = usersTokensFromLp.map((userTokensFromLp, i) => {
        return userTokensFromLp.add(usersEarnedTokensList[i]);
    });
    return Object.fromEntries(sumList.map((sum, i) => {
        const parsedSum = parseFloat((0, units_1.formatUnits)(sum, options.decimal));
        return [addresses[i], parsedSum];
    }));
}
exports.strategy = strategy;
