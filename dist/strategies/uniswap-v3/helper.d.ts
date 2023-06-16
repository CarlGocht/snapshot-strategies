import { FeeAmount, Position } from '@uniswap/v3-sdk';
export declare const getFeeAmount: (fee: string) => FeeAmount | undefined;
export declare const getAllReserves: (positionInfo: any) => any;
export declare const getReserves: ({ tickLower, tickUpper, liquidity, pool: { tick, sqrtPrice, feeTier }, token0, token1 }: any) => {
    token0Reserve: number;
    token1Reserve: number;
    poolTick: number;
    position: undefined;
    inRange: boolean;
} | {
    token0Reserve: number;
    token1Reserve: number;
    poolTick: any;
    position: Position;
    inRange: boolean;
};
