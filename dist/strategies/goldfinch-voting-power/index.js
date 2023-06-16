"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
const units_1 = require("@ethersproject/units");
exports.author = 'sanjayprabhu';
exports.version = '0.1.0';
const COMMUNITY_REWARDS = '0x0Cd73c18C085dEB287257ED2307eC713e9Af3460';
const STAKING_REWARDS = '0xFD6FF39DA508d281C2d255e9bBBfAb34B6be60c3';
const GFI = '0xdab396cCF3d84Cf2D07C4454e10C8A6F5b008D2b';
const MEMBERSHIP_REWARDS = '0x4e5d9b093986d864331d88e0a13a616e1d508838';
const COMMUNITY_REWARDS_ABI = [
    'function totalUnclaimed(address owner) view returns (uint256)'
];
const STAKING_REWARDS_ABI = [
    'function totalOptimisticClaimable(address owner) view returns (uint256)'
];
const MEMBERSHIP_REWARDS_ABI = [
    'function votingPower(address addr) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Held GFI
    const gfiResult = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, {
        address: GFI,
        symbol: 'GFI'
    }, snapshot);
    // Locked amount in Community Rewards
    const unclaimedCommunityRewards = await (0, utils_1.multicall)(network, provider, COMMUNITY_REWARDS_ABI, addresses.map((address) => [
        COMMUNITY_REWARDS,
        'totalUnclaimed',
        [address]
    ]), { blockTag });
    const unclaimedStakingRewards = await (0, utils_1.multicall)(network, provider, STAKING_REWARDS_ABI, addresses.map((address) => [
        STAKING_REWARDS,
        'totalOptimisticClaimable',
        [address]
    ]), { blockTag });
    const membershipRewards = await (0, utils_1.multicall)(network, provider, MEMBERSHIP_REWARDS_ABI, addresses.map((address) => [
        MEMBERSHIP_REWARDS,
        'votingPower',
        [address]
    ]), { blockTag });
    addresses.forEach((address, index) => {
        const parsedCommunityRewards = parseFloat((0, units_1.formatUnits)(unclaimedCommunityRewards[index][0], options.decimals));
        const parsedStakingRewards = parseFloat((0, units_1.formatUnits)(unclaimedStakingRewards[index][0], options.decimals));
        const parsedMembershipRewards = parseFloat((0, units_1.formatUnits)(membershipRewards[index][0], options.decimals));
        gfiResult[address] =
            gfiResult[address] +
                parsedCommunityRewards +
                parsedStakingRewards +
                parsedMembershipRewards;
    });
    return gfiResult;
}
exports.strategy = strategy;
