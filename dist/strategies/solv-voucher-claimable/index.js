"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'mitesh-mutha';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function tokenURI(uint256 tokenId) external view returns (string)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Fetch the balanceOf the addresses i.e. how many vouchers do they hold?
    const balanceOfMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => balanceOfMulti.call(address, options.address, 'balanceOf', [address]));
    const ownedCounts = await balanceOfMulti.execute();
    // Fetch the voucher token IDs held for each address
    const tokenIdsMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.map((address) => {
        let ownedCount = ownedCounts[address];
        while (ownedCount.gt(0)) {
            const index = ownedCount.sub(1);
            tokenIdsMulti.call(`${address}-${index.toString()}`, options.address, 'tokenOfOwnerByIndex', [address, index.toNumber()]);
            ownedCount = index;
        }
    });
    const ownerTokenIds = await tokenIdsMulti.execute();
    // Fetch the voucher data for each voucher held by an address among the address
    const tokenURIMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    Object.entries(ownerTokenIds).map(([addressWithIndex, tokenId]) => {
        tokenURIMulti.call(`${addressWithIndex}`, options.address, `tokenURI`, [
            tokenId
        ]);
    });
    const ownerTokenURIs = await tokenURIMulti.execute();
    // Go through the list of results and sum up claimable values
    const claimableVotingPower = {};
    Object.entries(ownerTokenURIs).map(([addressWithIndex, tokenURI]) => {
        const address = addressWithIndex.split('-')[0];
        if (tokenURI.split(',')[0] == 'data:application/json') {
            const tokenData = JSON.parse(tokenURI.slice(22));
            const claimableAmount = tokenData['properties']['claimableAmount'];
            if (!claimableVotingPower[address])
                claimableVotingPower[address] = bignumber_1.FixedNumber.from(0);
            claimableVotingPower[address] = claimableVotingPower[address].addUnsafe(bignumber_1.FixedNumber.fromString(claimableAmount));
        }
    });
    // Return the computed values
    return Object.fromEntries(Object.entries(claimableVotingPower).map(([address, votingPower]) => [
        address,
        votingPower.toUnsafeFloat()
    ]));
}
exports.strategy = strategy;
