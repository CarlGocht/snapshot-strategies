"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReserves = exports.getAllReserves = exports.getFeeAmount = void 0;
const v3_sdk_1 = require("@uniswap/v3-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
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
    if (parseInt(tick) < parseInt(tickLower.tickIdx) ||
        parseInt(tick) > parseInt(tickUpper.tickIdx)) {
        return {
            token0Reserve: 0,
            token1Reserve: 0,
            poolTick: 0,
            position: undefined,
            inRange: false
        };
    }
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
