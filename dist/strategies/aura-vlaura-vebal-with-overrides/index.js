"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_votes_with_override_1 = require("../erc20-votes-with-override");
exports.author = '0xMaharishi';
exports.version = '0.1.0';
const abi = [
    'function delegates(address account) external view returns (address)',
    'function getVotes(address account) external view returns (uint256)',
    'function totalSupply() public view returns (uint256)',
    'function balanceOf(address account) public view returns (uint256)'
];
/*
  Based on the `erc20-votes-with-override` strategy, with global vote scaling
  to represent the share of Aura's veBAL.
*/
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('vlAuraTotalSupply', options.auraLocker, 'totalSupply', []);
    multi.call('veBalOwnedByAura', options.votingEscrow, 'balanceOf', [
        options.auraVoterProxy
    ]);
    const res = await multi.execute();
    const scores = await (0, erc20_votes_with_override_1.strategy)(space, network, provider, addresses, {
        address: options.auraLocker,
        delegatesName: 'delegates',
        balanceOfName: 'balanceOf',
        getVotesName: 'getVotes',
        decimals: 18,
        includeSnapshotDelegations: options.includeSnapshotDelegations,
        delegationSpace: options.delegationSpace
    }, snapshot);
    const veBalOwnedByAura = parseFloat((0, units_1.formatUnits)(res.veBalOwnedByAura));
    const vlAuraTotalSupply = parseFloat((0, units_1.formatUnits)(res.vlAuraTotalSupply));
    return Object.fromEntries(Object.entries(scores).map(([address, score]) => [
        address,
        (veBalOwnedByAura * score) / vlAuraTotalSupply
    ]));
}
exports.strategy = strategy;
