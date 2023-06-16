"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
exports.author = 'emanuel-sol';
exports.version = '0.0.1';
const STAKING_CONTRACT = '0xd2863157539b1D11F39ce23fC4834B62082F6874';
const abi = [
    'function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) view returns (uint256[] memory)'
];
const calculateVotingPower = (userVotingPower, addresses, balances) => {
    for (let i = 0; i < addresses.length; i++) {
        userVotingPower[addresses[i]] =
            userVotingPower[addresses[i]] || bignumber_1.BigNumber.from(0);
        const balance = balances[i];
        userVotingPower[addresses[i]] = userVotingPower[addresses[i]].add(balance);
    }
    return userVotingPower;
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const params = {
        addresses: addresses
    };
    const response = await (0, cross_fetch_1.default)('https://api.forta.network/stats/shares', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    });
    const data = await response.json();
    const batchAddresses = [];
    const batchShareIds = [];
    data.shares.forEach((valuePair) => {
        if (valuePair.shares) {
            valuePair.shares.forEach((share) => {
                batchAddresses.push(addresses.find((addr) => addr.toLowerCase() === share.shareholder.toLowerCase()));
                batchShareIds.push(share.shareId);
            });
        }
    });
    const result = await (0, utils_1.multicall)(network, provider, abi, [[STAKING_CONTRACT, 'balanceOfBatch', [batchAddresses, batchShareIds]]], { blockTag });
    let userVotingPower = {};
    userVotingPower = calculateVotingPower(userVotingPower, batchAddresses, result[0][0]);
    return Object.fromEntries(Object.entries(userVotingPower).map((addressBalancePair) => [
        addressBalancePair[0],
        parseFloat((0, units_1.formatUnits)(addressBalancePair[1], 18))
    ]));
}
exports.strategy = strategy;
