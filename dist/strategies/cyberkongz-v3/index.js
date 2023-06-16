"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'maxbrand99';
exports.version = '1.0.0';
const bananaContract = '0xe2311ae37502105b442bbef831e9b53c5d2e9b3b';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const allAddresses = {};
    const promises = [];
    const blocks = await (0, utils_1.getSnapshots)(network, snapshot, provider, options.chains.map((s) => s.network || network));
    const allCalls = [];
    const chainCalls = { 1: [], 137: [] };
    options.chains.forEach((chain) => {
        if (chain.network == 1 || chain.network == 137) {
            Object.keys(chain.registries).forEach((registry) => {
                allAddresses[registry] = chain.registries[registry];
                addresses.forEach((address) => {
                    chainCalls[chain.network].push([registry, 'balanceOf', [address]]);
                    allCalls.push([registry, 'balanceOf', [address]]);
                });
            });
        }
    });
    Object.keys(chainCalls).forEach((chainID) => {
        const blockTag = typeof blocks[chainID] === 'number' ? blocks[chainID] : 'latest';
        promises.push((0, utils_1.multicall)(chainID, (0, utils_1.getProvider)(chainID), abi, chainCalls[chainID], {
            blockTag
        }));
    });
    const results = await Promise.all(promises);
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const nanaCall = [[bananaContract, 'totalSupply', []]];
    let nanaSupply = await (0, utils_1.multicall)(network, provider, abi, nanaCall, {
        blockTag
    });
    const response = [];
    results.forEach((result) => {
        result.forEach((value) => {
            response.push(value);
        });
    });
    response.forEach((value, i) => {
        const address = allCalls[i][2][0];
        if (allAddresses[allCalls[i][0]] == 'BANANA' &&
            options.skipList.find((add) => add === address)) {
            nanaSupply -= value;
        }
    });
    const merged = {};
    response.forEach((value, i) => {
        const address = allCalls[i][2][0];
        if (options.skipList.find((add) => add === address)) {
            return;
        }
        merged[address] = (merged[address] || 0);
        if (allAddresses[allCalls[i][0]] == 'OG')
            merged[address] += parseFloat((0, units_1.formatUnits)((3 * value).toString(), 0));
        else if (allAddresses[allCalls[i][0]] == 'VX')
            merged[address] += parseFloat((0, units_1.formatUnits)(value.toString(), 0));
        else if (allAddresses[allCalls[i][0]] == 'BANANA')
            merged[address] += parseFloat((0, units_1.formatUnits)(Math.floor((15000 * value) / nanaSupply).toString(), 0));
    });
    return merged;
}
exports.strategy = strategy;
