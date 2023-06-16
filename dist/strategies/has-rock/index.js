"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'AngelDAO';
exports.version = '0.1.0';
const abi = [
    'function rocks(uint256) view returns (address owner, bool currentlyForSale, uint256 price, uint256 timesSold)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const calls = [];
    for (let i = 0; i < 100; i++) {
        calls.push([options.address, 'rocks', [i]]);
    }
    const response = await (0, utils_1.multicall)(network, provider, abi, calls, { blockTag });
    const result = {};
    addresses.forEach((address) => {
        let addressRocks = 0;
        response.forEach((rockObject) => {
            if (rockObject.owner == address) {
                addressRocks++;
            }
        });
        result[address] = addressRocks;
    });
    return result;
}
exports.strategy = strategy;
