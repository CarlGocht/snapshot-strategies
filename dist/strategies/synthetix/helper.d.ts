import { BigNumber } from '@ethersproject/bignumber';
export declare const DebtCacheABI: string[];
export declare const SynthetixStateABI: string[];
export declare type SNXHoldersResult = {
    snxholders: {
        id: string;
        initialDebtOwnership: BigNumber;
        debtEntryAtIndex: BigNumber;
    }[];
};
export declare function returnGraphParams(snapshot: number | string, addresses: string[]): {
    snxholders: {
        __args: {
            where: {
                id_in: string[];
            };
            first: number;
            block: {
                number: string | number;
            };
        };
        id: boolean;
        initialDebtOwnership: boolean;
        debtEntryAtIndex: boolean;
    };
};
export declare const debtL1: (initialDebtOwnership: BigNumber, debtEntryAtIndex: BigNumber, totalL1Debt: number, scaledTotalL2Debt: number, lastDebtLedgerEntry: BigNumber, isQuadratic: boolean) => Promise<number>;
export declare const debtL2: (initialDebtOwnership: BigNumber, debtEntryAtIndex: BigNumber, totalL1Debt: number, scaledTotalL2Debt: number, lastDebtLedgerEntryL2: number, isQuadratic: boolean) => Promise<number>;
