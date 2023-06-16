"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'flushjb';
exports.version = '0.1.0';
const abi = [
    'function getActiveIndexes(address staker) external view returns (uint256[])',
    'function vestingStakedAmount(address _account, uint256[] _indexes) external view returns (uint256 _totalStaked)',
    'function getDividendStake(address _account, bool _isVested) external view returns (uint256 amount, uint256 profitDebt, uint256 weight, uint128 depositTime)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multicaller = new utils_1.Multicaller(network, provider, abi, { blockTag });
    // Get each user's active indexes and dividend stakes
    addresses.map(async (address) => {
        multicaller.call(`activeIndexes.${address}`, options.address, 'getActiveIndexes', [address]);
        multicaller.call(`dividendStakes.${address}`, options.address, 'getDividendStake', [address, true]);
        multicaller.call(`dividendStakesVested.${address}`, options.address, 'getDividendStake', [address, false]);
    });
    const result = await multicaller.execute();
    const multicaller2 = new utils_1.Multicaller(network, provider, abi, { blockTag });
    // Get each user's staked amount from each active index
    addresses.map(async (address) => {
        const activeIndexes = result.activeIndexes[address];
        multicaller2.call(`stakedAmount.${address}`, options.address, 'vestingStakedAmount', [address, activeIndexes]);
    });
    const result2 = await multicaller2.execute();
    // Calculate the total staked amount for each user and map it to the address
    return Object.fromEntries(Object.entries(result2.stakedAmount).map(([address, stakedAmount]) => {
        const dividendStakes = result.dividendStakes[address].amount;
        const dividendStakesVested = result.dividendStakesVested[address].amount;
        const totalStaked = parseFloat((0, units_1.formatUnits)(stakedAmount, 18)) +
            parseFloat((0, units_1.formatUnits)(dividendStakes, 18)) +
            parseFloat((0, units_1.formatUnits)(dividendStakesVested, 18));
        return [address, totalStaked];
    }));
}
exports.strategy = strategy;
