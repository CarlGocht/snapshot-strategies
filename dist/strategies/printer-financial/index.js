"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'printerfinancial';
exports.version = '0.1.1';
const abi = [
    'function balanceOf(address) view returns (uint256 amount)',
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)',
    'function totalSupply() view returns (uint256)',
    'function strategy() view returns (address)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    let multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call(`lp.inkBalance`, options.inkAddress, 'balanceOf', [
        options.lpPairAddress
    ]);
    multi.call(`lp.totalSupply`, options.lpPairAddress, 'totalSupply');
    addresses.forEach((address) => {
        multi.call(`ink.${address}`, options.inkAddress, 'balanceOf', [address]);
        multi.call(`inkInPrinter.${address}`, options.printerAddress, 'balanceOf', [
            address
        ]);
        multi.call(`lpInPools.${address}`, options.lpPoolAddress, 'userInfo', [
            options.lpPoolId,
            address
        ]);
        multi.call(`lp.${address}`, options.lpPairAddress, 'balanceOf', [address]);
    });
    const result = await multi.execute();
    return Object.fromEntries(addresses.map((address) => {
        const inkInWallet = parseFloat((0, units_1.formatUnits)(result.ink[address], 18));
        const inkInLpInWallet = parseFloat((0, units_1.formatUnits)(result.lp[address]
            .mul(result.lp.inkBalance)
            .div(result.lp.totalSupply), 18));
        const inkInPrinter = parseFloat((0, units_1.formatUnits)(result.inkInPrinter[address], 18));
        const inkInPools = parseFloat((0, units_1.formatUnits)(result.lpInPools[address].amount
            .mul(result.lp.inkBalance)
            .div(result.lp.totalSupply), 18));
        return [
            address,
            inkInWallet + inkInLpInWallet + inkInPrinter + inkInPools
        ];
    }));
}
exports.strategy = strategy;
