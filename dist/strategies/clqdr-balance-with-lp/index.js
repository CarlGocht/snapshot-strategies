"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'LiquidDriver-finance';
exports.version = '0.0.1';
const liquidMasterAddress = '0x6e2ad6527901c9664f016466b8DA1357a004db0f';
const beetsMasterAddress = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const lpAddress = '0xEAdCFa1F34308b144E96FcD7A07145E027A8467d';
const beetsVaultAddress = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce';
const clqdrPoolId = '0xeadcfa1f34308b144e96fcd7a07145e027a8467d000000000000000000000331';
const contractAbi = [
    'function userInfo(uint256, address) view returns (uint256 amount, int256 rewardDebt)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address _owner) view returns (uint256 balance)',
    'function getPoolTokens(bytes32 poolId) view returns (uint256[], uint256[], uint256)',
    'function getVirtualSupply() external view returns (uint256)'
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
    const res = await (0, utils_1.multicall)(network, provider, contractAbi, [
        [beetsVaultAddress, 'getPoolTokens', [clqdrPoolId]],
        [lpAddress, 'getVirtualSupply', []]
    ], { blockTag });
    const totalClqdrInBeets = bn(res[0][1][1]);
    const virtualSupply = bn(res[1]);
    const userCLqdrBalances = [];
    for (let i = 0; i < addresses.length - 1; i++) {
        userCLqdrBalances[addresses[i]] = bn(0);
    }
    const clqdrMulti = new utils_1.Multicaller(network, provider, contractAbi, {
        blockTag
    });
    addresses.forEach((address) => clqdrMulti.call(address, options.address, 'balanceOf', [address]));
    const clqdrToken = await clqdrMulti.execute();
    Object.fromEntries(Object.entries(clqdrToken).map(([address, balance]) => {
        return addUserBalance(userCLqdrBalances, address, balance);
    }));
    const userLpBalances = [];
    for (let i = 0; i < addresses.length - 1; i++) {
        userLpBalances[addresses[i]] = bn(0);
    }
    const multi = new utils_1.Multicaller(network, provider, contractAbi, { blockTag });
    addresses.forEach((address) => multi.call(address, lpAddress, 'balanceOf', [address]));
    const resultToken = await multi.execute();
    Object.fromEntries(Object.entries(resultToken).map(([address, balance]) => {
        return addUserBalance(userLpBalances, address, balance);
    }));
    const multiLiquidMaster = new utils_1.Multicaller(network, provider, contractAbi, {
        blockTag
    });
    addresses.forEach((address) => multiLiquidMaster.call(address, liquidMasterAddress, 'userInfo', [
        '43',
        address
    ]));
    const resultLiquidMaster = await multiLiquidMaster.execute();
    Object.fromEntries(Object.entries(resultLiquidMaster).map(([address, balance]) => {
        return addUserBalance(userLpBalances, address, balance[0]);
    }));
    const multiBeetsMaster = new utils_1.Multicaller(network, provider, contractAbi, {
        blockTag
    });
    addresses.forEach((address) => multiBeetsMaster.call(address, beetsMasterAddress, 'userInfo', [
        '69',
        address
    ]));
    const resultBeetsMaster = await multiBeetsMaster.execute();
    Object.fromEntries(Object.entries(resultBeetsMaster).map(([address, balance]) => {
        return addUserBalance(userLpBalances, address, balance[0]);
    }));
    return Object.fromEntries(Object.entries(userLpBalances).map(([address, balance]) => {
        const clqdrBalanceInLp = totalClqdrInBeets
            // @ts-ignore
            .mul(balance)
            .div(virtualSupply);
        const totalBalance = userCLqdrBalances[address].add(clqdrBalanceInLp);
        return [
            address,
            // @ts-ignore
            parseFloat((0, units_1.formatUnits)(totalBalance, options.decimals))
        ];
    }));
}
exports.strategy = strategy;
