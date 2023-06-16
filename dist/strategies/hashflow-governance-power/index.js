"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'mib-hashflow';
exports.version = '0.1.1';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function assetDetails(address token) external view returns (uint128 withdrawalLimit, uint128 cap, uint128 netPayout, uint128 timestamp, address hToken, address hTokenXChain, bool listed)',
    'function totalSupply() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const contractData = await (0, utils_1.multicall)(network, provider, abi, [
        [options.hftPool, 'assetDetails', [options.hftContract]],
        [options.hToken, 'totalSupply', []]
    ], { blockTag });
    const netPayout = contractData[0].netPayout;
    const totalSupply = contractData[1][0];
    const lpTokenWeight = parseFloat((0, units_1.formatUnits)(netPayout, 18)) /
        parseFloat((0, units_1.formatUnits)(totalSupply, 18));
    const hftMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => hftMulti.call(address, options.hftContract, 'balanceOf', [address]));
    const hftBalances = await hftMulti.execute();
    const lpMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => lpMulti.call(address, options.hToken, 'balanceOf', [address]));
    const lpBalances = await lpMulti.execute();
    return Object.fromEntries(Object.entries(hftBalances).map(([address, balance]) => [
        (0, address_1.getAddress)(address),
        parseFloat((0, units_1.formatUnits)(balance, 18)) +
            lpTokenWeight * parseFloat((0, units_1.formatUnits)(lpBalances[address], 18))
    ]));
}
exports.strategy = strategy;
