import { FeeAmount, Position } from '@uniswap/v3-sdk';
import { BigNumber } from '@ethersproject/bignumber';
export declare const getFeeAmount: (fee: string) => FeeAmount | undefined;
export declare const getAllReserves: (positionInfo: any) => any;
export declare const getReserves: ({ tickLower, tickUpper, liquidity, pool: { tick, sqrtPrice, feeTier }, token0, token1 }: any) => {
    token0Reserve: number;
    token1Reserve: number;
    poolTick: any;
    position: Position;
    inRange: boolean;
} | {
    token0Reserve: number;
    token1Reserve: number;
    poolTick: number;
    position: undefined;
    inRange: boolean;
};
export declare const UNISWAP_V3_STAKER = "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d";
interface Stake {
    owner: string;
    reward: BigNumber;
}
export declare const getStakeInfo: (blockTag: string | number, network: any, provider: any, options: any, tokenIDs: number[]) => Promise<Record<number, Stake>>;
export {};
