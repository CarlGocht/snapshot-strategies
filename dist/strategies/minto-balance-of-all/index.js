"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'btcmt-minto';
exports.version = '0.1.0';
const abi = [
    'function balanceOfSum(address account) external view returns (uint256)'
];
const stakingAbi = [
    'function userStakes(address account) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)'
];
const autoStakingAbi = [
    'function userStake(address account) external view returns (uint256, uint256, uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    const multiStaking = new utils_1.Multicaller(network, provider, stakingAbi, {
        blockTag
    });
    const multiAutoStaking = new utils_1.Multicaller(network, provider, autoStakingAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        multi.call(address, options.address, 'balanceOfSum', [address]);
        multiStaking.call(address, options.stakingAddress, 'userStakes', [address]);
        multiAutoStaking.call(address, options.autoStakingAddress, 'userStake', [
            address
        ]);
    });
    const [result, resultStaking, resultAutoStaking] = await Promise.all([
        multi.execute(),
        multiStaking.execute(),
        multiAutoStaking.execute()
    ]);
    return Object.fromEntries(addresses.map((address) => {
        const sum = parseFloat((0, units_1.formatUnits)(result[address], options.decimals)) +
            parseFloat((0, units_1.formatUnits)(resultStaking[address][1], options.decimals)) +
            parseFloat((0, units_1.formatUnits)(resultAutoStaking[address][0], options.decimals));
        return [address, sum];
    }));
}
exports.strategy = strategy;
