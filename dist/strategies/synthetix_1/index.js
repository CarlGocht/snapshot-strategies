"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const contracts_1 = require("@ethersproject/contracts");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'andytcf';
exports.version = '1.0.0';
const SDSABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() view returns (uint256)'
];
const DebtCacheABI = [
    'function currentDebt() view returns (uint256 debt, bool anyRateIsInvalid)'
];
const calculateSDSValue = async (provider, blockTag, debtCacheAddress, sdsAddress) => {
    const DebtCacheContract = new contracts_1.Contract(debtCacheAddress, DebtCacheABI, provider);
    const currentDebt = await DebtCacheContract.currentDebt({
        blockTag
    });
    const SDSContract = new contracts_1.Contract(sdsAddress, SDSABI, provider);
    const totalSupply = await SDSContract.totalSupply({
        blockTag
    });
    const value = Number(currentDebt.debt / totalSupply);
    return value;
};
async function strategy(_space, _network, _provider, _addresses, _options, _snapshot) {
    const score = {};
    const blockTag = typeof _snapshot === 'number' ? _snapshot : 'latest';
    const L2BlockTag = typeof _options.L2BlockNumber === 'number'
        ? _options.L2BlockNumber
        : 'latest';
    const optimismProvider = (0, utils_1.getProvider)('10');
    const L1SDSValue = await calculateSDSValue(_provider, _snapshot, _options.L1DebtCache, _options.L1SDS);
    const L2SDSValue = await calculateSDSValue(optimismProvider, L2BlockTag, _options.L2DebtCache, _options.L2SDS);
    const callL1SDSBalance = new utils_1.Multicaller(_network, _provider, SDSABI, {
        blockTag
    });
    for (const walletAddress of _addresses) {
        callL1SDSBalance.call(walletAddress, _options.L1SDS, 'balanceOf', [
            walletAddress
        ]);
    }
    const L1SDSBalances = await callL1SDSBalance.execute();
    Object.entries(L1SDSBalances).forEach(([address, balance]) => {
        score[(0, address_1.getAddress)(address)] = Number((0, units_1.formatEther)(balance)) * L1SDSValue;
    });
    const callL2SDSBalance = new utils_1.Multicaller('10', optimismProvider, SDSABI, {
        blockTag: L2BlockTag
    });
    for (const walletAddress of _addresses) {
        callL2SDSBalance.call(walletAddress, _options.L2SDS, 'balanceOf', [
            walletAddress
        ]);
    }
    const L2SDSBalances = await callL2SDSBalance.execute();
    Object.entries(L2SDSBalances).forEach(([address, balance]) => {
        score[(0, address_1.getAddress)(address)] += Number((0, units_1.formatEther)(balance)) * L2SDSValue;
    });
    /** Quadratic Weighting */
    if (_options.quadratic) {
        return Object.fromEntries(Object.entries(score).map(([address, balance]) => [
            address,
            Math.sqrt(balance)
        ]));
    }
    else {
        return score;
    }
}
exports.strategy = strategy;
