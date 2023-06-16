"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtL2 = exports.debtL1 = exports.returnGraphParams = exports.SynthetixStateABI = exports.DebtCacheABI = void 0;
const HIGH_PRECISE_UNIT = 1e27;
const MED_PRECISE_UNIT = 1e18;
const SCALING_FACTOR = 1e5;
exports.DebtCacheABI = [
    'function currentDebt() view returns (uint256 debt, bool anyRateIsInvalid)'
];
exports.SynthetixStateABI = [
    'function lastDebtLedgerEntry() view returns (uint256)'
];
function returnGraphParams(snapshot, addresses) {
    return {
        snxholders: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000,
                block: {
                    number: snapshot
                }
            },
            id: true,
            initialDebtOwnership: true,
            debtEntryAtIndex: true
        }
    };
}
exports.returnGraphParams = returnGraphParams;
const debtL1 = async (initialDebtOwnership, debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntry, isQuadratic) => {
    const currentDebtOwnershipPercent = (Number(lastDebtLedgerEntry) / Number(debtEntryAtIndex)) *
        Number(initialDebtOwnership);
    const highPrecisionBalance = totalL1Debt *
        MED_PRECISE_UNIT *
        (currentDebtOwnershipPercent / HIGH_PRECISE_UNIT);
    const currentDebtBalance = highPrecisionBalance / MED_PRECISE_UNIT;
    const totalDebtInSystem = totalL1Debt + scaledTotalL2Debt;
    const ownershipPercentOfTotalDebt = currentDebtBalance / totalDebtInSystem;
    const scaledWeighting = ownershipPercentOfTotalDebt * SCALING_FACTOR;
    return isQuadratic ? Math.sqrt(scaledWeighting) : scaledWeighting;
};
exports.debtL1 = debtL1;
const debtL2 = async (initialDebtOwnership, debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntryL2, isQuadratic) => {
    const currentDebtOwnershipPercent = (Number(lastDebtLedgerEntryL2) / Number(debtEntryAtIndex)) *
        Number(initialDebtOwnership);
    const highPrecisionBalance = totalL1Debt *
        MED_PRECISE_UNIT *
        (currentDebtOwnershipPercent / HIGH_PRECISE_UNIT);
    const currentDebtBalance = highPrecisionBalance / MED_PRECISE_UNIT;
    const totalDebtInSystem = totalL1Debt + scaledTotalL2Debt;
    const ownershipPercentOfTotalDebt = currentDebtBalance / totalDebtInSystem;
    const scaledWeighting = ownershipPercentOfTotalDebt * SCALING_FACTOR;
    return isQuadratic ? Math.sqrt(scaledWeighting) : scaledWeighting;
};
exports.debtL2 = debtL2;
