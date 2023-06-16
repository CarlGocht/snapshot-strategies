"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const utils_1 = require("../../utils");
const helper_1 = require("../synthetix/helper");
exports.author = 'andytcf';
exports.version = '1.0.0';
const MED_PRECISE_UNIT = 1e18;
// @TODO: check if most-up-to-date version (using https://contracts.synthetix.io/SynthetixState)
const SynthetixStateContractAddress = '0x4b9Ca5607f1fF8019c1C6A3c2f0CC8de622D5B82';
// @TODO: check if most-up-to-date version (using http://contracts.synthetix.io/DebtCache)
const DebtCacheContractAddress = '0xe92B4c7428152052B0930c81F4c687a5F1A12292';
const defaultGraphs = {
    '1': 'https://api.thegraph.com/subgraphs/name/killerbyte/synthetix',
    '10': 'https://api.thegraph.com/subgraphs/name/synthetixio-team/optimism-issuance'
};
// @TODO: update with the latest ovm snapshot
// const ovmSnapshotJSON = 'QmNwvhq4By1Mownjycg7bWSXqbJWMVyAWRZ1K4mjxuvGXg';
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
async function strategy(_space, _network, _provider, _addresses, _, snapshot) {
    const score = {};
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    /* Global Constants */
    const totalL1Debt = await loadL1TotalDebt(_provider, snapshot); // (high-precision 1e18)
    const lastDebtLedgerEntry = await loadLastDebtLedgerEntry(_provider, snapshot);
    /* EDIT THESE FOR OVM */
    // @TODO update the currentDebt for the snapshot from (https://contracts.synthetix.io/ovm/DebtCache)
    const totalL2Debt = 22617610;
    // @TODO update the lastDebtLedgerEntry from (https://contracts.synthetix.io/ovm/SynthetixState)
    const lastDebtLedgerEntryL2 = 20222730523217499684984991;
    // @TODO update the comparison between OVM:ETH c-ratios at the time of snapshot
    const normalisedL2CRatio = 600 / 450;
    // @TODO update the L2 block number to use
    const L2BlockNumber = 1770186;
    const scaledTotalL2Debt = totalL2Debt * normalisedL2CRatio;
    /* --------------- */
    /* Using the subgraph, we get the relevant L1 calculations */
    const l1Results = (await (0, utils_1.subgraphRequest)(defaultGraphs[1], (0, helper_1.returnGraphParams)(blockTag, _addresses)));
    if (l1Results && l1Results.snxholders) {
        for (let i = 0; i < l1Results.snxholders.length; i++) {
            const holder = l1Results.snxholders[i];
            const vote = await (0, helper_1.debtL1)(holder.initialDebtOwnership, holder.debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntry, false);
            score[(0, address_1.getAddress)(holder.id)] = vote;
        }
    }
    /* Using the subgraph, we get the relevant L2 calculations */
    const l2Results = (await (0, utils_1.subgraphRequest)(defaultGraphs[10], (0, helper_1.returnGraphParams)(L2BlockNumber, _addresses)));
    // @notice fallback for when subgraph is down
    /*
      const OVMSnapshot = await ipfsGet('gateway.pinata.cloud', ovmSnapshotJSON);
      const array = Object.assign(
        {},
        ...OVMSnapshot.data.snxholders.map((key) => ({
          [getAddress(key.id)]: {
          initialDebtOwnership: key.initialDebtOwnership,
          debtEntryAtIndex: key.debtEntryAtIndex
          }
        }))
      );
      for (let k = 0; k < _addresses.length; k++) {
        const address = _addresses[k];
        if (array[getAddress(address)]) {
          score[getAddress(address)] += await quadraticWeightedVoteL2(
            array[getAddress(address)].initialDebtOwnership,
            array[getAddress(address)].debtEntryAtIndex,
            totalL1Debt,
            scaledTotalL2Debt,
            lastDebtLedgerEntryL2
          );
        } else {
          continue;
        }
      }
    */
    if (l2Results && l2Results.snxholders) {
        for (let i = 0; i < l2Results.snxholders.length; i++) {
            const holder = l2Results.snxholders[i];
            const vote = await (0, helper_1.debtL2)(holder.initialDebtOwnership, holder.debtEntryAtIndex, totalL1Debt, scaledTotalL2Debt, lastDebtLedgerEntryL2, false);
            if (score[(0, address_1.getAddress)(holder.id)]) {
                score[(0, address_1.getAddress)(holder.id)] += vote;
            }
            else {
                score[(0, address_1.getAddress)(holder.id)] = vote;
            }
        }
    }
    return score || {};
}
exports.strategy = strategy;
