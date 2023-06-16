"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const erc1155_all_balances_of_1 = require("../erc1155-all-balances-of");
exports.author = 'sanjayprabhu';
exports.version = '0.1.0';
const goListAbi = ['function goList(address) view returns (bool)'];
const LEGACY_GOLDFINCH_CONFIG = '0x4eb844Ff521B4A964011ac8ecd42d500725C95CC';
const UID = '0xba0439088dc1e75F58e0A7C107627942C15cbb41';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const uidResult = await (0, erc1155_all_balances_of_1.strategy)(space, network, provider, addresses, {
        address: UID,
        symbol: 'UID'
    }, snapshot);
    const goListResult = await (0, utils_1.multicall)(network, provider, goListAbi, addresses.map((address) => [
        LEGACY_GOLDFINCH_CONFIG,
        'goList',
        [address]
    ]), { blockTag });
    // If you don't have a UID, but are on the goList, that's OK.
    addresses.forEach((address, index) => {
        if (!uidResult[address] && goListResult[index][0]) {
            uidResult[address] = 1;
        }
    });
    return uidResult;
}
exports.strategy = strategy;
