"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const networks_json_1 = __importDefault(require("@snapshot-labs/snapshot.js/src/networks.json"));
exports.author = 'dannyposi';
exports.version = '0.0.1';
const abi = [
    'function getEthBalance(address addr) public view returns (uint256 balance)'
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingResponse = await provider.send('hmyv2_getValidatorsStakeByBlockNumber', [blockTag]);
    const stakingBalances = Object.fromEntries(Object.entries(stakingResponse)
        .filter(([address]) => addresses.includes(address))
        .map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from('0x' + balance.toString(16)), options && options.decimals ? options.decimals : 18))
    ]));
    const balanceResponse = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        networks_json_1.default[network].multicall,
        'getEthBalance',
        [address]
    ]), { blockTag });
    const decimals = options.decimals || 18;
    const currentBalances = Object.fromEntries(balanceResponse.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), decimals))
    ]));
    return Object.entries(currentBalances).reduce((acc, [key, value]) => ({ ...acc, [key]: (acc[key] || 0) + value }), { ...stakingBalances });
}
exports.strategy = strategy;
