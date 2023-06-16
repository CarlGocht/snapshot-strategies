"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'abg4';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function designatedVotingContracts(address) view returns (address)'
];
function getArgs(options, address) {
    const args = options.args || ['%{address}'];
    return args.map((arg) => typeof arg === 'string' ? arg.replace(/%{address}/g, address) : arg);
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const votingAddress = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.votingFactoryAddress,
        'designatedVotingContracts',
        getArgs(options, address)
    ]), { blockTag });
    const response = await (0, utils_1.multicall)(network, provider, abi, votingAddress.map((address) => [
        options.address,
        'balanceOf',
        getArgs(options, address)
    ]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(options?.output ? value[options.output].toString() : value.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
