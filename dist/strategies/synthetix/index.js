"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const utils_1 = require("../../utils");
const helper_1 = require("./helper");
exports.author = 'andytcf';
exports.version = '1.0.0';
const SynthetixStateContractAddress = '0x4b9Ca5607f1fF8019c1C6A3c2f0CC8de622D5B82';
const DebtCacheContractAddress = '0x9bB05EF2cA7DBAafFC3da1939D1492e6b00F39b8';
const defaultGraphs = {
    '1': 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix',
    '10': 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-general'
};
const ovmSnapshotJSON = 'QmNwvhq4By1Mownjycg7bWSXqbJWMVyAWRZ1K4mjxuvGXg';
const HIGH_PRECISE_UNIT = 1e27;
const MED_PRECISE_UNIT = 1e18;
const SCALING_FACTOR = 1e5;
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
const loadLastDebtLedgerEntry = async (provider, snapshot) => {
    const contract = new contracts_1.Contract(SynthetixStateContractAddress, helper_1.SynthetixStateABI, provider);
    const lastDebtLedgerEntry = await contract.lastDebtLedgerEntry({
        blockTag: snapshot
    });
    return bignumber_1.BigNumber.from(lastDebtLedgerEntry);
};
const loadL1TotalDebt = async (provider, snapshot) => {
    const contract = new contracts_1.Contract(DebtCacheContractAddress, helper_1.DebtCacheABI, provider);
    const currentDebtObject = await contract.currentDebt({
        blockTag: snapshot
    });
    return Number(currentDebtObject.debt) / MED_PRECISE_UNIT;
};
const quadraticWeightedVoteL1 = async (initialDebtOwnership, debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntry) => {
    const currentDebtOwnershipPercent = (Number(lastDebtLedgerEntry) / Number(debtEntryAtIndex)) *
        Number(initialDebtOwnership);
    const highPrecisionBalance = totalL1Debt *
        MED_PRECISE_UNIT *
        (currentDebtOwnershipPercent / HIGH_PRECISE_UNIT);
    const currentDebtBalance = highPrecisionBalance / MED_PRECISE_UNIT;
    const totalDebtInSystem = totalL1Debt + scaledTotalL2Debt;
    const ownershipPercentOfTotalDebt = currentDebtBalance / totalDebtInSystem;
    const scaledWeighting = ownershipPercentOfTotalDebt * SCALING_FACTOR;
    return Math.sqrt(scaledWeighting);
};
const quadraticWeightedVoteL2 = async (initialDebtOwnership, totalL1Debt, scaledTotalL2Debt, normalisedL2CRatio) => {
    const totalDebtInSystem = totalL1Debt + scaledTotalL2Debt;
    const ownershipPercentBN = Number(initialDebtOwnership) * normalisedL2CRatio;
    const ownershipPercent = ownershipPercentBN / HIGH_PRECISE_UNIT;
    const ownershipOfDebtDollarValue = ownershipPercent * scaledTotalL2Debt;
    const ownershipPercentOfTotalDebt = ownershipOfDebtDollarValue / totalDebtInSystem;
    const scaledWeighting = ownershipPercentOfTotalDebt * SCALING_FACTOR;
    return Math.sqrt(scaledWeighting);
};
async function strategy(_space, _network, _provider, _addresses, _, snapshot) {
    const score = {};
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const l1Results = (await (0, utils_1.subgraphRequest)(defaultGraphs[1], returnGraphParams(blockTag, _addresses)));
    const normalisedL2CRatio = 1000 / 450;
    const totalL1Debt = await loadL1TotalDebt(_provider, snapshot); // (high-precision 1e18)
    const lastDebtLedgerEntry = await loadLastDebtLedgerEntry(_provider, snapshot);
    const totalL2Debt = 4792266; // $4,792,266 (high-precision 1e18)
    const scaledTotalL2Debt = totalL2Debt * normalisedL2CRatio;
    if (l1Results && l1Results.snxholders) {
        for (let i = 0; i < l1Results.snxholders.length; i++) {
            const holder = l1Results.snxholders[i];
            score[(0, address_1.getAddress)(holder.id)] = await quadraticWeightedVoteL1(holder.initialDebtOwnership, holder.debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntry);
        }
    }
    const OVMSnapshot = await (0, utils_1.ipfsGet)('gateway.pinata.cloud', ovmSnapshotJSON);
    const array = Object.assign({}, ...OVMSnapshot.data.snxholders.map((key) => ({
        [(0, address_1.getAddress)(key.id)]: key.initialDebtOwnership
    })));
    for (let k = 0; k < _addresses.length; k++) {
        const address = _addresses[k];
        if (array[(0, address_1.getAddress)(address)]) {
            score[(0, address_1.getAddress)(address)] += await quadraticWeightedVoteL2(array[(0, address_1.getAddress)(address)], totalL1Debt, scaledTotalL2Debt, normalisedL2CRatio);
        }
        else {
            continue;
        }
    }
    return score || {};
}
exports.strategy = strategy;
