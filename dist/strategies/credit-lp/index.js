"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
// import { BigNumberish } from '@ethersproject/bignumber';
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = '0xEntropy';
exports.version = '0.1.0';
const abi = [
    'function getUserInfo(uint256 _pid, address _user) view returns (tuple(uint256 amount, uint256[] RewardDebt, uint256[] RemainingRewards))',
    'function getPricePerFullShare() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('lpTotalSupply', options.lpToken, 'totalSupply', []);
    multi.call('creditInLp', options.address, 'balanceOf', [options.lpToken]);
    multi.call('pricePerShare', options.crypt, 'getPricePerFullShare', []);
    addresses.forEach((address) => {
        multi.call(`chef.${address}`, options.masterchef, 'getUserInfo', [
            options.pid,
            address
        ]);
        multi.call(`lp.${address}`, options.lpToken, 'balanceOf', [address]);
        multi.call(`reaper.${address}`, options.crypt, 'balanceOf', [address]);
    });
    const result = await multi.execute();
    const creditInLp = parseFloat((0, units_1.formatUnits)(result.creditInLp, options.decimals));
    const lpTotalSupply = parseFloat((0, units_1.formatUnits)(result.lpTotalSupply));
    const creditPerLp = creditInLp / lpTotalSupply;
    return Object.fromEntries(addresses.map((address) => {
        const reaperVal = result.reaper[address];
        const raw = reaperVal.div(result.pricePerShare);
        return [
            address,
            parseFloat((0, units_1.formatUnits)(result.lp[address])) * creditPerLp +
                parseFloat((0, units_1.formatUnits)(result.chef[address].amount)) * creditPerLp +
                parseFloat((0, units_1.formatUnits)(raw)) * creditPerLp
        ];
    }));
}
exports.strategy = strategy;
