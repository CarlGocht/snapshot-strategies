"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const networks_json_1 = __importDefault(require("@snapshot-labs/snapshot.js/src/networks.json"));
exports.author = 'bonustrack';
exports.version = '0.1.0';
const abi = [
    'function getEthBalance(address addr) public view returns (uint256 balance)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        networks_json_1.default[network].multicall,
        'getEthBalance',
        [address]
    ]), { blockTag });
    const decimals = options.decimals || 18;
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), decimals))
    ]));
}
exports.strategy = strategy;
