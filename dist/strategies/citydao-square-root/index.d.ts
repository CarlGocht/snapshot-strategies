import type { StaticJsonRpcProvider } from '@ethersproject/providers';
declare type ScoresByAddress = {
    [address: string]: number;
};
declare type Params = {
    symbol: string;
    address: string;
    tokenId: number;
    decimals: number;
    voiceCredits?: number;
};
declare const author = "citydao";
declare const version = "0.0.1";
/**
 * CityDAO Square Root Snapshot Strategy
 * @version 0.0.1
 * @summary Holders of an ERC1155 token can cast a number of votes equal to the square root of their net token holdings.
 * @see https://archive.ph/beczV
 * @author Will Holley <https://721.dev>
 */
declare function strategy(space: string, network: string, provider: StaticJsonRpcProvider, addresses: Array<string>, params: Params, snapshot: number): Promise<ScoresByAddress>;
export { author, version, strategy };
