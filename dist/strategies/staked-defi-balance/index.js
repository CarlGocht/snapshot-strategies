"use strict";
// src/strategies/staked-defi-balance/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const openStakingABI_json_1 = __importDefault(require("./ABI/openStakingABI.json"));
const standardStakingABI_json_1 = __importDefault(require("./ABI/standardStakingABI.json"));
exports.author = 'taha-abbasi';
exports.version = '1.3.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const maxContractsPerStrategy = 5;
    if (options.contracts.length > maxContractsPerStrategy) {
        throw new Error('Maximum of 5 contracts allowed per strategy, see details: https://github.com/snapshot-labs/snapshot-strategies#code');
    }
    const addressScores = {};
    for (const params of options.contracts) {
        const paramNetwork = network.toString();
        const paramSnapshot = typeof snapshot === 'number' ? snapshot : 'latest';
        const stakingPoolContractAddress = params.stakingPoolContractAddress;
        let abi;
        switch (params.stakingType) {
            case 'open':
                abi = openStakingABI_json_1.default[0];
                break;
            case 'standard':
                abi = standardStakingABI_json_1.default[0];
                break;
            default:
                throw new Error(`Invalid stakingType: ${params.stakingType}`);
        }
        const stakingCalls = addresses.map((address) => {
            const inputs = abi.inputs.map((input) => {
                if (input.name === 'id') {
                    return params.tokenContractAddress;
                }
                else if (input.name === 'staker' || input.name === 'account') {
                    return address;
                }
            });
            return [stakingPoolContractAddress, abi.name, inputs];
        });
        const stakes = await (0, utils_1.multicall)(paramNetwork, (0, utils_1.getProvider)(paramNetwork), [abi], stakingCalls, { blockTag: paramSnapshot });
        const stakesMapped = {};
        for (let i = 0; i < addresses.length; i++) {
            stakesMapped[(0, address_1.getAddress)(addresses[i])] = stakes[i][0];
        }
        addresses.forEach((address) => {
            const normalizedAddress = (0, address_1.getAddress)(address);
            const stakedBalance = stakesMapped[normalizedAddress];
            const formattedStakedBalance = parseFloat((0, units_1.formatUnits)(stakedBalance, params.decimals));
            if (!addressScores[normalizedAddress]) {
                addressScores[normalizedAddress] = 0;
            }
            addressScores[normalizedAddress] += formattedStakedBalance;
        });
    }
    const minStakedBalance = parseFloat(options.minStakedBalance);
    Object.keys(addressScores).forEach((address) => {
        if (addressScores[address] < minStakedBalance) {
            delete addressScores[address];
        }
    });
    return addressScores;
}
exports.strategy = strategy;
