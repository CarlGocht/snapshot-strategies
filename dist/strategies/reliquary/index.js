"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = '0xSkly'; // coAuthor = 'franzns'
exports.version = '0.1.0';
const abi = [
    'function relicPositionsOfOwner(address owner) view returns (uint256[] relicIds, tuple(uint256 amount, uint256 rewardDebt, uint256 rewardCredit, uint256 entry, uint256 poolId, uint256 level)[] positionInfos)',
    'function getLevelInfo(uint256 pid) view returns (tuple(uint256[] requiredMaturities, uint256[] multipliers, uint256[] balance) levelInfo)',
    'function levelOnUpdate(uint256 relicId) view returns (uint256 level)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    for (const address of addresses) {
        multi.call(address, options.reliquaryAddress, 'relicPositionsOfOwner', [
            address
        ]);
    }
    // first we get all relics for each voter
    const relicPositionsByOwner = await multi.execute();
    // then we filter by the configured pool ID
    const relevantRelicPositions = Object.entries(relicPositionsByOwner).flatMap(([owner, [relicIds, positions]]) => positions
        .map((position, index) => ({
        owner,
        relicId: relicIds[index].toNumber(),
        poolId: position.poolId.toNumber(),
        amount: position.amount,
        level: position.level.toNumber()
    }))
        .filter((position) => position.poolId === options.poolId));
    // if the strategy should use the level on update, we override the level
    if (options.useLevelOnUpdate) {
        for (const relicPosition of relevantRelicPositions) {
            multi.call(`${relicPosition.owner}.${relicPosition.relicId}.level`, options.reliquaryAddress, 'levelOnUpdate', [relicPosition.relicId]);
        }
        const relicLevelByVoterAndRelic = await multi.execute();
        for (const relicPosition of relevantRelicPositions) {
            relicPosition.level =
                relicLevelByVoterAndRelic[relicPosition.owner][relicPosition.relicId].level.toNumber();
        }
    }
    const userVotingPower = {};
    /*
      if we use the level strategy, we just add the level as a multiplier in relation to the max level.
      So the formula used is: relicAmount * level / maxLevel
    */
    if (options.strategy === 'level') {
        for (const relicPosition of relevantRelicPositions) {
            const multiplier = relicPosition.level >= options.minVotingLevel
                ? Math.min(options.maxVotingLevel, relicPosition.level)
                : 0;
            const votingPower = parseFloat((0, units_1.formatUnits)(relicPosition.amount.mul(multiplier).div(options.maxVotingLevel), options.decimals ?? 18));
            if (relicPosition.owner in userVotingPower) {
                userVotingPower[relicPosition.owner] += votingPower;
            }
            else {
                userVotingPower[relicPosition.owner] = votingPower;
            }
        }
        return userVotingPower;
    }
    /*
      otherwise we use the level multiplier to weight the voting power. For this
      we need to get the multipliers for each level for the configured pool.
      The formula used is: relicAmount * levelMultiplier / maxMultiplier
  
    */
    const poolLevelInfo = await (0, utils_1.call)(provider, abi, [options.reliquaryAddress, 'getLevelInfo', [options.poolId]], { blockTag });
    const maxMultiplier = poolLevelInfo.multipliers[options.maxVotingLevel];
    for (const relicPosition of relevantRelicPositions) {
        const multiplier = poolLevelInfo.multipliers[Math.min(options.maxVotingLevel, relicPosition.level)].toNumber();
        const votingPower = parseFloat((0, units_1.formatUnits)(relicPosition.amount.mul(multiplier).div(maxMultiplier), options.decimals ?? 18));
        if (relicPosition.owner in userVotingPower) {
            userVotingPower[relicPosition.owner] += votingPower;
        }
        else {
            userVotingPower[relicPosition.owner] = votingPower;
        }
    }
    return userVotingPower;
}
exports.strategy = strategy;
