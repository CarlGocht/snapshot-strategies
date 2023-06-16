"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'scottrepreneur';
exports.version = '0.1.0';
const abi = [
    'function memberAddressByDelegateKey(address) view returns (address)',
    'function members(address) view returns (address delegateKey, uint256 shares, uint256 loot, bool exists, uint256 highestIndexYesVote, uint256 jailed)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const memberAddresses = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.address,
        'memberAddressByDelegateKey',
        [address]
    ]), { blockTag });
    const response = await (0, utils_1.multicall)(network, provider, abi, memberAddresses
        .filter((addr) => addr.toString() !== '0x0000000000000000000000000000000000000000')
        .map((addr) => [options.address, 'members', [addr.toString()]]), { blockTag });
    const addressesWithMemberAddress = addresses.filter((addr, i) => memberAddresses[i].toString() !==
        '0x0000000000000000000000000000000000000000');
    return Object.fromEntries(response.map((value, i) => [
        addressesWithMemberAddress[i],
        parseFloat((0, units_1.formatUnits)(value.shares.toString(), options.decimals)) +
            parseFloat((0, units_1.formatUnits)(value.loot.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
