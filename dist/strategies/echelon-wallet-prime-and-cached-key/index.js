"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'brandonleung';
exports.version = '1.0.0';
const cachingAbi = [
    'function cacheInfo(uint256, address) view returns (uint256 amount, int256 rewardDebt)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingPool = new utils_1.Multicaller(network, provider, cachingAbi, {
        blockTag
    });
    const startingBlockTimestamp = (await provider.getBlock(options.startingBlock)).timestamp;
    const endingBlockTimestamp = startingBlockTimestamp + 2628288 * options.monthsToDecay;
    const currentBlockTimestamp = (await provider.getBlock(snapshot)).timestamp;
    const decayRate = (0 - options.baseValue) / (endingBlockTimestamp - startingBlockTimestamp);
    const votingPowerPerKey = options.baseValue +
        decayRate * (currentBlockTimestamp - startingBlockTimestamp);
    addresses.forEach((address) => {
        stakingPool.call(address, options.stakingAddress, 'cacheInfo', [
            0,
            address
        ]);
    });
    const contractResponse = await stakingPool.execute();
    const cachedKeyScore = Object.fromEntries(addresses.map((address) => {
        return [
            address,
            contractResponse[address][0].toNumber() * votingPowerPerKey
        ];
    }));
    const walletScore = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const votingPower = Object.entries(walletScore).reduce((address, [key, value]) => ({
        ...address,
        [key]: (address[key] || 0) + value
    }), { ...cachedKeyScore });
    Object.keys(votingPower).forEach((key) => {
        votingPower[key] = Math.sqrt(votingPower[key]);
    });
    return votingPower;
}
exports.strategy = strategy;
