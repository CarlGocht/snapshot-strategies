"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = '0xAppo';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    if (options.beneficiaryAddresses.length >= 25 ||
        options.contractAddresses.length >= 25) {
        throw new Error('Too many beneficiary/contract addresses provided.');
    }
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        if (options.beneficiaryAddresses.includes(address)) {
            const index = options.beneficiaryAddresses.indexOf(address);
            const contractAddress = options.contractAddresses[index];
            multi.call(address, options.address, 'balanceOf', [contractAddress]);
        }
    });
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        (0, address_1.getAddress)(address),
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
