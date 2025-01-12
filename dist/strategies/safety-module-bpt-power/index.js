"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const balancer_poolid_1 = require("../balancer-poolid");
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'mwamedacen';
exports.version = '0.1.0';
async function fetchSafetyModuleScore(space, network, provider, addresses, options, snapshot) {
    const scores = await (0, balancer_poolid_1.strategy)(space, network, provider, [options.safetyModule.address], {
        poolId: options.balancerPoolId,
        token: options.votingToken.address
    }, snapshot);
    return parseFloat(scores[options.safetyModule.address]);
}
const SafetyModuleMinABI = [
    'function totalSupply() external view returns (uint256)',
    'function STAKED_TOKEN() external view returns (address)',
    'function REWARD_TOKEN() external view returns (address)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address account) external view returns (uint256)',
    'function getTotalRewardsBalance(address staker) view returns (uint256)'
];
const TOTAL_SUPPLY_ATTR = 'totalSupply';
const STAKED_TOKEN_ATTR = 'stakedToken';
const REWARD_TOKEN_ATTR = 'rewardToken';
const BALANCE_OF_ATTR = 'balanceOf';
const REWARDS_OF_ATTR = 'totalRewardsBalance';
async function fetchAccountsSafetyModuleStakesAndRewards(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, SafetyModuleMinABI, {
        blockTag
    });
    addresses.forEach((address) => {
        multi.call(`${BALANCE_OF_ATTR}_${address}`, options.safetyModule.address, 'balanceOf', [address]);
        multi.call(`${REWARDS_OF_ATTR}_${address}`, options.safetyModule.address, 'getTotalRewardsBalance', [address]);
    });
    const result = await multi.execute();
    return Object.entries(result).reduce((acc, [key, value]) => {
        const [attr, addr] = key.split('_');
        if (!acc[addr]) {
            acc[addr] = {};
        }
        acc[addr][attr] = value;
        return acc;
    }, {});
}
async function fetchSafetyModuleGlobalState(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, SafetyModuleMinABI, {
        blockTag
    });
    multi.call(STAKED_TOKEN_ATTR, options.safetyModule.address, 'STAKED_TOKEN');
    multi.call(REWARD_TOKEN_ATTR, options.safetyModule.address, 'REWARD_TOKEN');
    multi.call(TOTAL_SUPPLY_ATTR, options.safetyModule.address, 'totalSupply');
    const result = await multi.execute();
    return result;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const [safetyModuleScore, accountsStakesAndRewards, safetyModuleGlobalState] = await Promise.all([
        fetchSafetyModuleScore,
        fetchAccountsSafetyModuleStakesAndRewards,
        fetchSafetyModuleGlobalState
    ].map((fn) => fn(space, network, provider, addresses, options, snapshot)));
    const safetyModuleStakedToken = safetyModuleGlobalState[STAKED_TOKEN_ATTR];
    if (safetyModuleStakedToken.toLowerCase() !==
        options.balancerPoolId.substring(0, 42).toLowerCase()) {
        throw new Error(`safety-module-bpt-power, safety module's staken token ${safetyModuleStakedToken} doesn't match balancer pool ${options.balancerPoolId}`);
    }
    const safetyModuleRewardsToken = safetyModuleGlobalState[REWARD_TOKEN_ATTR];
    const votingAndRewardTokenMatching = safetyModuleRewardsToken.toLowerCase() ===
        options.votingToken.address.toLowerCase();
    const safetyModuleTotalSupply = parseFloat((0, units_1.formatUnits)(safetyModuleGlobalState[TOTAL_SUPPLY_ATTR], options.safetyModule.decimals));
    const scores = Object.fromEntries(Object.entries(accountsStakesAndRewards).map(([address, accountStakesAndRewards]) => {
        const accountSafetyModuleBalance = parseFloat((0, units_1.formatUnits)(accountStakesAndRewards[BALANCE_OF_ATTR], options.safetyModule.decimals));
        const accountSharePercent = accountSafetyModuleBalance / safetyModuleTotalSupply;
        const accountStakedScore = accountSharePercent * safetyModuleScore;
        if (!votingAndRewardTokenMatching) {
            return [address, accountStakedScore];
        }
        const accountRewardsScore = parseFloat((0, units_1.formatUnits)(accountStakesAndRewards[REWARDS_OF_ATTR], options.votingToken.decimals));
        const accountStakedAndRewardsScore = accountStakedScore + accountRewardsScore;
        return [address, accountStakedAndRewardsScore];
    }));
    return scores;
}
exports.strategy = strategy;
