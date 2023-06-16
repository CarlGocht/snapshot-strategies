"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'ApeSwapFinance';
exports.version = '0.0.1';
const GNANA_POOL = '0x8F97B2E6559084CFaBA140e2AB4Da9aAF23FE7F8';
const abi = [
    'function balanceOf(address _owner) view returns (uint256 balance)',
    'function userInfo(address) view returns (uint256 amount, uint256 rewardDebt)'
];
const bn = (num) => {
    return bignumber_1.BigNumber.from(num.toString());
};
const addUserBalance = (userBalances, user, balance) => {
    if (userBalances[user]) {
        return (userBalances[user] = userBalances[user].add(balance));
    }
    else {
        return (userBalances[user] = balance);
    }
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multicall = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multicall.call(`token.${address}`, options.address, 'balanceOf', [address]);
        multicall.call(`pool.${address}`, GNANA_POOL, 'userInfo', [address]);
    });
    const result = await multicall.execute();
    const userBalances = [];
    for (let i = 0; i < addresses.length - 1; i++) {
        userBalances[addresses[i]] = bn(0);
    }
    addresses.forEach((address) => {
        addUserBalance(userBalances, address, result.token[address] ?? 0);
        addUserBalance(userBalances, address, result.pool[address][0] ?? 0);
    });
    return Object.fromEntries(Object.entries(userBalances).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
