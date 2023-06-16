"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
exports.author = 'morpho-labs';
exports.version = '0.1.0';
const DSSVestAbi = [
    'function usr(uint256 _id) external view returns (address)',
    'function tot(uint256 _id) external view returns (uint256)',
    'function accrued(uint256 _id) external view returns (uint256)',
    'function ids() external view returns (uint256)'
];
const ERC20abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
const vestedAmountPower = (totalVestedNotClaimed, startDate, period, now) => {
    now = bignumber_1.BigNumber.from(now);
    const amount = bignumber_1.BigNumber.from(totalVestedNotClaimed);
    if (now.lte(startDate))
        return bignumber_1.BigNumber.from(0);
    if (now.gt(bignumber_1.BigNumber.from(startDate).add(period)))
        return totalVestedNotClaimed;
    return now.sub(startDate).mul(amount).div(period);
};
const idsArray = (maxId) => Array.from({ length: maxId }, (_, i) => i + 1);
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const block = await provider.getBlock(blockTag);
    const now = block.timestamp;
    // fetch the number of vesting accounts
    const maxId = await (0, utils_1.call)(provider, DSSVestAbi, [options.DSSVestAddress, 'ids', []], {
        blockTag
    });
    // create an array of each vesting ID: [1:maxId]
    const ids = idsArray(maxId.toNumber());
    // We first fetch the balance of ERC20 for each addresses
    const multiBalanceOf = new utils_1.Multicaller(network, provider, ERC20abi, {
        blockTag
    });
    addresses.forEach((address) => multiBalanceOf.call(address, options.ERC20Address, 'balanceOf', [address]));
    const addressesBalanceOf = await multiBalanceOf.execute();
    // And then, we fetch the vesting data for each vesting ID
    // 1. vester address
    const multiVest = new utils_1.Multicaller(options.vestingNetwork, provider, DSSVestAbi, {
        blockTag
    });
    ids.forEach((id) => multiVest.call(id, options.DSSVestAddress, 'usr', [id]));
    const vestedAddresses = await multiVest.execute();
    // 2. total vested
    const multiVestTotCaller = new utils_1.Multicaller(options.vestingNetwork, provider, DSSVestAbi, { blockTag });
    ids.forEach((id) => multiVestTotCaller.call(id, options.DSSVestAddress, 'tot', [id]));
    const multiVestTot = await multiVestTotCaller.execute();
    // 3. total claimed
    const multiVestAccruedCaller = new utils_1.Multicaller(options.vestingNetwork, provider, DSSVestAbi, { blockTag });
    ids.forEach((id) => multiVestAccruedCaller.call(id, options.DSSVestAddress, 'accrued', [id]));
    const multiVestAccrued = await multiVestAccruedCaller.execute();
    return Object.fromEntries(Object.entries(addressesBalanceOf).map(([address, balance]) => {
        const initialVotingPower = [
            address,
            parseFloat((0, units_1.formatUnits)(balance, options.decimals))
        ];
        // fetch vested users data
        const [id] = Object.entries(vestedAddresses).find(([, _address]) => _address === address) ?? [];
        if (id === undefined)
            return initialVotingPower;
        const totalVested = multiVestTot[id];
        const totalAccrued = multiVestAccrued[id];
        if (!(id && totalAccrued && totalVested))
            return initialVotingPower;
        const votingPower = bignumber_1.BigNumber.from(balance).add(vestedAmountPower(bignumber_1.BigNumber.from(totalVested).sub(totalAccrued), options.startVesting, options.vestingDuration, now));
        return [address, parseFloat((0, units_1.formatUnits)(votingPower, options.decimals))];
    }));
}
exports.strategy = strategy;
