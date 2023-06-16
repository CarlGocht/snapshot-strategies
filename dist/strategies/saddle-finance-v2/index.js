"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const vestingContractAddrs_1 = require("./vestingContractAddrs");
exports.author = 'saddle-finance';
exports.version = '0.1.0';
const SDLTokenAddress = '0xf1Dc500FdE233A4055e25e5BbF516372BC4F6871';
const RetroRewardsContract = '0x5DCA270671935cf3dF78bd8373C22BE250198a03';
const abi = [
    'function balanceOf(address) external view returns (uint256)',
    'function beneficiary() external view returns (address)',
    'function vestings(address) external view returns (bool isVerified, uint120 totalAmount, uint120 released)',
    'function vestedAmount() public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const remappedMerkleDataRes = await (0, cross_fetch_1.default)('https://gateway.pinata.cloud/ipfs/QmV73GEaijyiBFHu1vRdZBFffoCHaXYWG5SpurbEgr4VK6', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const remappedMerkleData = await remappedMerkleDataRes.json();
    const userWalletBalanceResponse = (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        SDLTokenAddress,
        'balanceOf',
        [address.toLowerCase()]
    ]), { blockTag });
    const beneficiaries = (0, utils_1.multicall)(network, provider, abi, vestingContractAddrs_1.vestingContractAddrs.map((vestingContractAddress) => [
        vestingContractAddress.toLowerCase(),
        'beneficiary'
    ]), { blockTag });
    const vestedAndUnclaimedAmountRes = (0, utils_1.multicall)(network, provider, abi, vestingContractAddrs_1.vestingContractAddrs.map((vestingContractAddress) => [
        vestingContractAddress.toLowerCase(),
        'vestedAmount'
    ]), { blockTag });
    const retroAddrs = Object.keys(remappedMerkleData);
    const userVestingsRes = (0, utils_1.multicall)(network, provider, abi, retroAddrs.map((retroAddr) => [
        RetroRewardsContract,
        'vestings',
        [retroAddr.toLowerCase()]
    ]), { blockTag });
    const balances = await Promise.all([
        userWalletBalanceResponse,
        vestedAndUnclaimedAmountRes,
        beneficiaries,
        userVestingsRes
    ]);
    const retroUserBalances = {};
    retroAddrs.forEach((addr, i) => {
        const userVesting = balances[3][i];
        if (userVesting?.isVerified) {
            retroUserBalances[addr.toLowerCase()] = parseFloat((0, units_1.formatUnits)(userVesting.totalAmount.sub(userVesting.released).toString(), 18));
        }
        else {
            retroUserBalances[addr.toLowerCase()] = parseFloat((0, units_1.formatUnits)(remappedMerkleData[addr].amount, 18));
        }
    });
    const mappedBeneficiariesToUnclaimedAmount = balances[2].reduce((acc, addr, i) => ({
        ...acc,
        [addr]: parseFloat((0, units_1.formatUnits)(balances[1][i][0].toString(), 18))
    }), {});
    const userWalletBalances = balances[0].map((amount, i) => {
        return [
            addresses[i].toLowerCase(),
            parseFloat((0, units_1.formatUnits)(amount.toString(), 18))
        ];
    });
    const userTotal = {};
    // loop through user, investor/advisor/team-member, and airdrop wallets to calculate total.
    userWalletBalances.forEach(([address, amount]) => {
        const addr = address.toLowerCase();
        if (userTotal[addr])
            userTotal[addr] += amount;
        else
            userTotal[addr] = amount;
    });
    for (const [address, amount] of Object.entries(retroUserBalances)) {
        const addr = address.toLowerCase();
        if (userTotal[addr])
            userTotal[addr] += amount;
        else
            userTotal[addr] = amount;
    }
    for (const [address, amount] of Object.entries(mappedBeneficiariesToUnclaimedAmount)) {
        const addr = address.toLowerCase();
        if (userTotal[addr])
            userTotal[addr] += amount;
        else
            userTotal[addr] = amount;
    }
    const finalUserBalances = Object.fromEntries(addresses.map((addr) => [addr, userTotal[addr.toLowerCase()]]));
    return finalUserBalances;
}
exports.strategy = strategy;
