"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'jordanmessina';
exports.version = '0.1.0';
const lootAbi = [
    'function balanceOf(address owner) external view returns (uint256 balance)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)'
];
const lootCharacterGuildsAbi = [
    'function guildLoots(uint256 tokenId) external view returns (uint256 guild)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const lootBalanceOfMulti = new utils_1.Multicaller(network, provider, lootAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        lootBalanceOfMulti.call(address, options.lootAddress, 'balanceOf', [
            address
        ]);
    });
    const lootBalanceOfResult = await lootBalanceOfMulti.execute();
    const lootTokenOwnerMulti = new utils_1.Multicaller(network, provider, lootAbi, {
        blockTag
    });
    for (const [address, balance] of Object.entries(lootBalanceOfResult)) {
        for (let i = 0; i < balance; i++) {
            lootTokenOwnerMulti.call(`${address}-${i}`, options.lootAddress, 'tokenOfOwnerByIndex', [address, String(i)]);
        }
    }
    const lootBagOwners = await lootTokenOwnerMulti.execute();
    const guildLootsMulti = new utils_1.Multicaller(network, provider, lootCharacterGuildsAbi, { blockTag });
    for (const [addressAndBagIndex, bagId] of Object.entries(lootBagOwners)) {
        guildLootsMulti.call(addressAndBagIndex, options.lootCharacterGuildsAddress, 'guildLoots', [String(bagId)]);
    }
    const lootOwnerToGuild = await guildLootsMulti.execute();
    const votes = {};
    for (const [addressAndBagIndex, guild] of Object.entries(lootOwnerToGuild)) {
        if (String(guild) === String(options.guildId)) {
            const address = addressAndBagIndex.split('-')[0];
            votes[address] = address in votes ? votes[address] + 1 : 1;
        }
    }
    return Object.fromEntries(addresses.map((address) => [
        address,
        address in votes ? votes[address] : 0
    ]));
}
exports.strategy = strategy;
