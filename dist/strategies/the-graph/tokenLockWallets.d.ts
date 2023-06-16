import { Provider } from '@ethersproject/providers';
export declare const TOKEN_DISTRIBUTION_SUBGRAPH_URL: {
    '1': string;
    '4': string;
};
interface TokenLockWallets {
    [key: string]: string[];
}
/**
  @dev Queries the subgraph to find if an address owns any token lock wallets
  @returns An object with the beneficiaries as keys and TLWs as values in an array
*/
export declare function getTokenLockWallets(_space: string, network: string, _provider: Provider, addresses: string[], options: Record<string, any>, snapshot: string | number): Promise<TokenLockWallets>;
export {};
