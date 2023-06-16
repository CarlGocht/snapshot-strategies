"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'deversifi';
exports.version = '0.1.0';
const vestedABI = ['function delegateForVoting() view returns (address)'];
const xDVFABI = ['function balanceOf(address account) view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const { vestedContracts, xDVFAddress, decimals } = options;
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const lowerCaseAddresses = {};
    addresses.forEach((item) => (lowerCaseAddresses[item.toLowerCase()] = true));
    let beneficiaries = await (0, utils_1.multicall)(network, provider, vestedABI, vestedContracts.map((address) => [address, 'delegateForVoting', []]), { blockTag });
    if (beneficiaries.length > 0) {
        beneficiaries = beneficiaries
            .map((item, index) => ({
            beneficiary: item[0],
            vestedContract: vestedContracts[index]
        }))
            .filter((item) => lowerCaseAddresses[item.beneficiary.toLowerCase()]);
        const balances = await (0, utils_1.multicall)(network, provider, xDVFABI, beneficiaries.map((item) => [
            xDVFAddress,
            'balanceOf',
            [item.vestedContract]
        ]));
        return Object.fromEntries(beneficiaries.map((b, i) => [
            b.beneficiary,
            parseFloat((0, units_1.formatUnits)(balances[i].toString(), decimals))
        ]));
    }
    return {};
}
exports.strategy = strategy;
