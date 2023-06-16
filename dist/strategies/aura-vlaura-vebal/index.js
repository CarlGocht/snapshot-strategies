"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = '0xMaharishi';
exports.version = '0.1.0';
const abi = [
    'function getVotes(address account) external view returns (uint256)',
    'function totalSupply() public view returns (uint256)',
    'function balanceOf(address account) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('vlAuraTotalSupply', options.auraLocker, 'totalSupply', []);
    addresses.forEach((address) => multi.call(`vlAuraVotes.${address}`, options.auraLocker, 'getVotes', [
        address
    ]));
    multi.call('veBalOwnedByAura', options.votingEscrow, 'balanceOf', [
        options.auraVoterProxy
    ]);
    const res = await multi.execute();
    return Object.fromEntries(Object.entries(res.vlAuraVotes).map(([address, votes]) => [
        address,
        parseFloat((0, units_1.formatUnits)(res.veBalOwnedByAura.mul(votes).div(res.vlAuraTotalSupply), 18))
    ]));
}
exports.strategy = strategy;
