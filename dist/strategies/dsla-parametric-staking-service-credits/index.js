"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'gmtesla';
exports.version = '0.1.1';
// const DSLA = '0x3aFfCCa64c2A6f4e3B6Bd9c64CD2C969EFd1ECBe';
// const StakingSLA = '0x091ee4d4D8FfD00698c003C21F1ba69EA6310241';
// const LP_TOKEN = '0xAC104C0438A7bb15C714503537c6FA271FDB284E';  // dpToken
// const SP_TOKEN = '0xcf4ea46eba95fe3643b6c954d29516d7376913dc'   // duToken
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function usersPool(address token) external view returns (uint256)',
    'function providersPool(address token) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Get dpToken Balances
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.xDSLA_LP, 'balanceOf', [address]));
    const dpTokenBalances = await multi.execute();
    // Get duToken Balances
    addresses.forEach((address) => multi.call(address, options.xDSLA, 'balanceOf', [address]));
    const duTokenBalances = await multi.execute();
    // Get totalSupply of user/provider pools
    const multi2 = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi2.call('userTotalSupply', options.xDSLA, 'totalSupply', []);
    multi2.call('providerTotalSupply', options.xDSLA_LP, 'totalSupply', []);
    multi2.call('usersPool', options.StakingSLA, 'usersPool', [options.DSLA]);
    multi2.call('providersPool', options.StakingSLA, 'providersPool', [
        options.DSLA
    ]);
    const res2 = await multi2.execute();
    // Sum up duTokenBalance and dpTokenBalances
    // dTokenBalance = staked amount * total supply / (userPools or providerPools)
    // staked amount = dTokenBalance * (userPools or providerPools) / total supply
    const balances = Object.fromEntries(Object.entries(dpTokenBalances).map(([address, balance]) => [
        address,
        bignumber_1.BigNumber.from(balance)
            .mul(res2.providersPool)
            .div(res2.providerTotalSupply)
    ]));
    Object.entries(duTokenBalances).forEach(([address, balance]) => {
        const prevBal = bignumber_1.BigNumber.from(balances[address]);
        balances[address] = prevBal.add(bignumber_1.BigNumber.from(balance).mul(res2.usersPool).div(res2.userTotalSupply));
    });
    const result = Object.fromEntries(Object.entries(balances).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
    return result;
}
exports.strategy = strategy;
