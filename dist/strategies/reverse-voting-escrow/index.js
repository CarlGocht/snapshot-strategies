"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
exports.author = 'nascentxyz';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner) external view returns (uint256)',
    'function getClaimableAmount(bytes32 cohortId, uint256 index, address account, uint256 fullAmount) external view returns (uint256)',
    'function getClaimed(bytes32 cohortId, address account) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // ** The full address -> balance mapping ** //
    const reverseVotingBalance = {};
    // ** Extract `club` and `vesting` contract addresses ** //
    // ** If not provided, default to hardcoded values ** //
    const club = options.club
        ? options.club
        : '0xF76d80200226AC250665139B9E435617e4Ba55F9';
    const vesting = options.vesting
        ? options.vesting
        : '0xD46f00d9F1f6d2e65D9572F9ce283ba925FE591a';
    // ** $CLUB balance
    const callWalletToClubBalance = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToClubBalance.call(walletAddress, club, 'balanceOf', [
            walletAddress
        ]);
    }
    const walletToClubBalance = await callWalletToClubBalance.execute();
    for (const [walletID, balance] of Object.entries(walletToClubBalance)) {
        const address = walletID.split('-')[0];
        reverseVotingBalance[address] = reverseVotingBalance[address]
            ? reverseVotingBalance[address].add(balance)
            : balance;
    }
    // ?? Available CLUB Agora API Endpoints ?? //
    // ?? https://github.com/agoraxyz/club-backend#endpoints ?? //
    // [GET] hello?name=World: a test endpoint with an optional parameter
    // [GET] cohort/:cohortId: checks if a specific cohort with cohortId exists in the database or the contract. If both are true, returns it's data
    // [GET] cohort-ids/:account: returns the IDs of the cohorts the account is in
    // [GET] claim-data/:cohortId/:account: returns the claim data for a specific account in a specific cohort (cohortId)
    // [GET] all-claim-data/:account: returns the claim data for a specific account from all the cohorts it is in
    // [GET] all-data: returns all claim data
    const allData = await (0, cross_fetch_1.default)(`https://club.agora.space/api/all-data`);
    const allDataJSON = await allData.json();
    // ** Claimed $CLUB tokens ** //
    const getWalletToClaimedAmount = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    // ** Vested Mapping ** //
    let walletToVestedAmount = {};
    // ** Loop over all claim data ** //
    for (const [cohortId, cohortData] of Object.entries(allDataJSON)) {
        // ** Claimable (vested) $CLUB tokens ** //
        const getWalletToVestedAmount = new utils_1.Multicaller(network, provider, abi, {
            blockTag
        });
        // ** Iterate over addresses in the cohort with claims ** //
        for (const [address, amountData] of Object.entries(cohortData)) {
            if (addresses.includes(address)) {
                // ** Extract the full amount of CLUB ** //
                const amount = amountData;
                const fullAmount = amount.amount
                    ? bignumber_1.BigNumber.from(amount.amount)
                    : bignumber_1.BigNumber.from(0);
                const indexData = amountData;
                const index = indexData.index
                    ? bignumber_1.BigNumber.from(amount.index)
                    : bignumber_1.BigNumber.from(0);
                // ** Create The Vested Amount Call ** //
                getWalletToVestedAmount.call(address, vesting, 'getClaimableAmount', [
                    cohortId,
                    index,
                    address,
                    fullAmount // fullAmount
                ]);
                // ** Create The Claimed Call ** //
                getWalletToClaimedAmount.call(address, vesting, 'getClaimed', [
                    cohortId,
                    address // account
                ]);
            }
        }
        // ** Execute the vested multicall ** //
        try {
            // This should return a mapping of wallet addresses to vested amounts
            const tempWalletVestedAmounts = await getWalletToVestedAmount.execute();
            walletToVestedAmount = Object.assign(walletToVestedAmount, tempWalletVestedAmounts);
        }
        catch (e) {
            // !! IGNORE Multicall REVERTS !! //
        }
    }
    // ** Execute the claimed multicall ** //
    const walletToClaimedAmount = await getWalletToClaimedAmount.execute();
    // ** Map address to its full amount of claimable tokens ** //
    const listOfFullAmounts = Object.entries(allDataJSON)
        .map(([cohortId, cohortData]) => Object.entries(cohortData).map(([address, data]) => [
        cohortId,
        address,
        data.amount,
        data.index
    ]))
        .reduce((prev, curr) => {
        return prev.concat(curr);
    });
    const fullAmounts = new Map(listOfFullAmounts.map(([, address, amount]) => [address, amount]));
    // ** Iterate over the full amounts mapping from address -> total claim amount **//
    fullAmounts.forEach((amount, address) => {
        const vestedBalance = walletToVestedAmount[address] || bignumber_1.BigNumber.from(0);
        const claimedBalance = walletToClaimedAmount[address] || bignumber_1.BigNumber.from(0);
        // ?? voting_power = current_balance +
        // ??                vested_balance +
        // ??                0.1 * (fullAmount - vestedBalance - claimedBalance)
        const vestingPower = bignumber_1.BigNumber.from(amount)
            .sub(vestedBalance)
            .sub(claimedBalance)
            .div(bignumber_1.BigNumber.from(10));
        const addedVotingPower = vestedBalance.add(vestingPower);
        reverseVotingBalance[address] = reverseVotingBalance[address]
            ? reverseVotingBalance[address].add(addedVotingPower)
            : addedVotingPower;
    });
    // ** Return address, balance mapping ** //
    const scores = Object.fromEntries(addresses.map((address) => [
        address,
        reverseVotingBalance[address]
            ? parseFloat((0, units_1.formatUnits)(reverseVotingBalance[address].toString(), options.decimals))
            : 0
    ]));
    return scores;
}
exports.strategy = strategy;
