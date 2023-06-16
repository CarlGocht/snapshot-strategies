"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.examples = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const examples_json_1 = __importDefault(require("./examples.json"));
exports.author = 'helixgeometry';
exports.version = '0.0.1';
exports.examples = examples_json_1.default;
const abi = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address _owner) view returns (uint256 balance)',
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
];
const autoHelixAbi = [
    'function userInfo(address) view returns (uint256 amount, uint256 rewardDebt)',
    'function getPricePerFullShare() view returns (uint256)'
];
const vaultAbi = ['function getDepositAmount(address) view returns (uint256)'];
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
        multicall.call(`masterChef.${address}`, options.masterChef, 'userInfo', [
            '0',
            address
        ]);
    });
    options.helixLPs.forEach((lp) => {
        multicall.call(`lp.${lp.pid}.totalSupply`, lp.address, 'totalSupply');
        multicall.call(`lp.${lp.pid}.balanceOf`, options.address, 'balanceOf', [
            lp.address
        ]);
        addresses.forEach((address) => {
            multicall.call(`lpUsers.${address}.${lp.pid}`, options.masterChef, 'userInfo', [lp.pid, address]);
        });
    });
    const multicallAutoCompound = new utils_1.Multicaller(network, provider, autoHelixAbi, {
        blockTag
    });
    multicallAutoCompound.call('priceShare', options.autoHelix, 'getPricePerFullShare');
    addresses.forEach((address) => {
        multicallAutoCompound.call(`autoPool.${address}`, options.autoHelix, 'userInfo', [address]);
    });
    const multicallVault = new utils_1.Multicaller(network, provider, vaultAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        multicallVault.call(`vault.${address}`, options.vault, 'getDepositAmount', [
            address
        ]);
    });
    const [resultVault, resultAutoHelix, result] = await Promise.all([
        multicallVault.execute(),
        multicallAutoCompound.execute(),
        multicall.execute()
    ]);
    const userBalances = [];
    for (let i = 0; i < addresses.length - 1; i++) {
        userBalances[addresses[i]] = bn(0);
    }
    addresses.forEach((address) => {
        addUserBalance(userBalances, address, result.token[address]);
        addUserBalance(userBalances, address, result.masterChef[address][0]);
        addUserBalance(userBalances, address, resultAutoHelix.autoPool[address][0]
            .mul(resultAutoHelix.priceShare)
            .div(bn((0, units_1.parseUnits)('1', options.decimals))));
        options.helixLPs.forEach((lp) => {
            addUserBalance(userBalances, address, result.lpUsers[address][lp.pid][0]
                .mul(result.lp[lp.pid].balanceOf)
                .div(result.lp[lp.pid].totalSupply));
        });
        addUserBalance(userBalances, address, resultVault.vault[address]);
    });
    return Object.fromEntries(Object.entries(userBalances).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
