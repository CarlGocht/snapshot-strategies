"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'clement-ux';
exports.version = '0.0.1';
exports.dependOnOtherAddress = false;
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function working_supply() external view returns (uint256)',
    'function working_balances(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    // BlockTag
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Query
    const workingBalanceQuery = addresses.map((address) => [
        options.sdTokenGauge,
        'working_balances',
        [address]
    ]);
    // Multicall
    const response = await (0, utils_1.multicall)(network, provider, abi, [
        [options.sdTokenGauge, 'working_supply'],
        [options.veToken, 'balanceOf', [options.liquidLocker]],
        ...workingBalanceQuery
    ], {
        blockTag
    });
    // Constant
    const workingSupply = response[0]; // working supply on gauge
    const votingPowerLiquidLocker = response[1]; // balanceOf veCRV LiquidLocker
    // Return
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => {
        const votingPower = workingSupply > 0
            ? (response[i + 2] * votingPowerLiquidLocker) /
                (workingSupply * 10 ** options.decimals)
            : 0;
        return [addresses[i], votingPower];
    }));
}
exports.strategy = strategy;
