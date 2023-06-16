"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStakeInfo = exports.UNISWAP_V3_STAKER = exports.getReserves = exports.getAllReserves = exports.getFeeAmount = void 0;
const v3_sdk_1 = require("@uniswap/v3-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const utils_1 = require("../../utils");
const getFeeAmount = (fee) => {
    const feeAmount = Object.values(v3_sdk_1.FeeAmount).includes(parseFloat(fee))
        ? parseFloat(fee)
        : undefined;
    return feeAmount;
};
exports.getFeeAmount = getFeeAmount;
const getAllReserves = (positionInfo) => {
    return positionInfo?.map((info) => {
        return (0, exports.getReserves)(info);
    });
};
exports.getAllReserves = getAllReserves;
const getReserves = ({ tickLower, tickUpper, liquidity, pool: { tick, sqrtPrice, feeTier }, token0, token1 }) => {
    const [_baseToken, _quoteToken] = [
        new sdk_core_1.Token(1, token0.id, Number(token0.decimals), token0.symbol),
        new sdk_core_1.Token(1, token1.id, Number(token1.decimals), token1.symbol)
    ];
    const _fee = (0, exports.getFeeAmount)(feeTier) ?? 0;
    const pool = new v3_sdk_1.Pool(_baseToken, _quoteToken, _fee, sqrtPrice, liquidity, Number(tick));
    if (pool) {
        const position = new v3_sdk_1.Position({
            pool,
            liquidity,
            tickLower: Number(tickLower.tickIdx),
            tickUpper: Number(tickUpper.tickIdx)
        });
        return {
            token0Reserve: parseFloat(position.amount0.toSignificant(4)),
            token1Reserve: parseFloat(position.amount1.toSignificant(4)),
            poolTick: tick,
            position,
            inRange: true
        };
    }
    return {
        token0Reserve: 0,
        token1Reserve: 0,
        poolTick: 0,
        position: undefined,
        inRange: false
    };
};
exports.getReserves = getReserves;
const V3_STAKER_ABI = [
    'function deposits(uint256 tokenId) external view returns ((address owner, uint48 numberOfStakes, int24 tickLower, int24 tickUpper))',
    'function getRewardInfo((address,address,uint256,uint256,address), uint256 tokenId) external view returns (uint256 reward, uint160 secondsInsideX128)'
];
// Canonical V3 staker contract across all networks
exports.UNISWAP_V3_STAKER = '0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d';
const getStakeInfo = async (blockTag, network, provider, options, tokenIDs) => {
    const incentiveKey = [
        options.rewardToken,
        options.poolAddress,
        options.startTime,
        options.endTime,
        options.refundee
    ];
    // This helps us parallelize everything in one execution
    const multi = new utils_1.Multicaller(network, provider, V3_STAKER_ABI, { blockTag });
    tokenIDs.forEach((tokenID) => {
        multi.call(`deposit-${tokenID}`, exports.UNISWAP_V3_STAKER, 'deposits', [tokenID]);
        multi.call(`reward-${tokenID}`, exports.UNISWAP_V3_STAKER, 'getRewardInfo', [
            incentiveKey,
            tokenID
        ]);
    });
    const results = await multi.execute();
    const keys = Object.keys(results);
    const depositResults = Object.fromEntries(keys
        .filter((k) => k.includes('deposit'))
        .map((k) => {
        const tokenID = k.split('-')[1];
        return [tokenID, results[`deposit-${tokenID}`]];
    }));
    const rewardResults = Object.fromEntries(keys
        .filter((k) => k.includes('reward'))
        .map((k) => {
        const tokenID = k.split('-')[1];
        return [tokenID, results[`reward-${tokenID}`]];
    }));
    return Object.fromEntries(Object.entries(depositResults).map(([tokenID, deposit]) => [
        tokenID,
        {
            owner: deposit.owner.toLowerCase(),
            reward: rewardResults[tokenID].reward
        }
    ]));
};
exports.getStakeInfo = getStakeInfo;
