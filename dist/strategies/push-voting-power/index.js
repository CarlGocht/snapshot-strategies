"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'mujtaba1747';
exports.version = '0.1.0';
const tokenBNtoNumber = (tokenBn) => {
    return (tokenBn.div(bignumber_1.BigNumber.from(10).pow(bignumber_1.BigNumber.from(10))).toNumber() /
        100000000);
};
const sharedABI = [
    'function balanceOf(address user, address token) view returns (uint256)',
    'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)'
];
const wethABI = ['function balanceOf(address) view returns (uint256)'];
const epnsTokenABI = [
    'function getCurrentVotes(address account) view returns (uint96)',
    'function balanceOf(address account) view returns (uint256)'
];
const epnsLpABI = ['function totalSupply() view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const responseEPNSToken = await (0, utils_1.multicall)(network, provider, epnsTokenABI, [[options.pushTokenAddr, 'balanceOf', [options.pushLPTokenAddr]]].concat(addresses.map((address) => [
        options.pushTokenAddr,
        'getCurrentVotes',
        [address.toLowerCase()]
    ])), { blockTag });
    // Used .slice, as 2 different type of calls to the same contract were made in a
    // single Multicall using .concat
    // This was done because the number of Multicalls allowed is limited to 5 by Snapshot
    const responseDelegatedPUSH = responseEPNSToken.slice(1);
    const pushAmountReserve = tokenBNtoNumber(responseEPNSToken.slice(0, 1)[0][0]);
    const responseStaked = await (0, utils_1.multicall)(network, provider, sharedABI, addresses
        .map((address) => [
        options.stakingAddr,
        'balanceOf',
        [address.toLowerCase(), options.pushTokenAddr]
    ])
        .concat(addresses.map((address) => [
        options.stakingAddr,
        'balanceOf',
        [address.toLowerCase(), options.pushLPTokenAddr]
    ])), { blockTag });
    const responseStakedPUSH = responseStaked.slice(0, addresses.length);
    const responseStakedLP = responseStaked.slice(addresses.length);
    const responseWETH = await (0, utils_1.multicall)(network, provider, wethABI, [[options.WETHAddress, 'balanceOf', [options.pushLPTokenAddr]]], { blockTag });
    const wethAmountReserve = tokenBNtoNumber(responseWETH[0][0]);
    const responseLPConversion = await (0, utils_1.multicall)(network, provider, sharedABI, [
        [
            options.uniswapV2Router02,
            'getAmountsOut',
            [
                '1000000000000000000',
                [options.pushTokenAddr, options.WETHAddress, options.USDTAddress]
            ]
        ],
        [
            options.uniswapV2Router02,
            'getAmountsOut',
            ['1000000000000000000', [options.WETHAddress, options.USDTAddress]]
        ]
    ], { blockTag });
    // pushPrice and wethPrice are in terms of USDT
    const pushPrice = responseLPConversion[0]['amounts'][2].toNumber() / 1e6;
    const wethPrice = responseLPConversion[1]['amounts'][1].toNumber() / 1e6;
    const responseEPNSLPToken = await (0, utils_1.multicall)(network, provider, epnsLpABI, [[options.pushLPTokenAddr, 'totalSupply', []]], { blockTag });
    // Calculating price of EPNS-LP Tokens in terms of EPNS Tokens
    const uniLpTotalSupply = tokenBNtoNumber(responseEPNSLPToken[0][0]);
    const uniLpPrice = (pushAmountReserve * pushPrice + wethAmountReserve * wethPrice) /
        uniLpTotalSupply;
    const lpToPushRatio = uniLpPrice / pushPrice;
    return Object.fromEntries(responseDelegatedPUSH.map((value, i) => [
        addresses[i],
        // Voting Power = Delegated PUSH + Staked PUSH + Staked UNI-LP PUSH
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals)) +
            parseFloat((0, units_1.formatUnits)(responseStakedPUSH[i].toString(), options.decimals)) +
            parseFloat((0, units_1.formatUnits)(responseStakedLP[i].toString(), options.decimals)) *
                lpToPushRatio
    ]));
}
exports.strategy = strategy;
