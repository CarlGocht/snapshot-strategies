"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'andrewkingme';
exports.version = '0.1.0';
const abi = [
    'function ownerOf(uint256 tokenId) public view returns (address owner)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, options.tokenIds.map((id) => [options.address, 'ownerOf', [id]]), { blockTag });
    return Object.fromEntries(addresses.map((address) => [
        address,
        response.filter((element) => element.owner.toLowerCase() === address.toLowerCase()).length
    ]));
}
exports.strategy = strategy;
