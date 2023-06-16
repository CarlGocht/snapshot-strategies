"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Vivek205';
exports.version = '0.1.0';
const stakingAbi = [
    'function getStakeInfo(uint256 stakeMapIndex, address staker) public view returns (bool found, uint256 approvedAmount, uint256 pendingForApprovalAmount, uint256 rewardComputeIndex, uint256 claimableAmount)'
];
const parseNumber = (value) => bignumber_1.BigNumber.from(value);
const parseStakeInfo = (value) => ({
    approvedAmount: parseNumber(value.approvedAmount),
    pendingApprovalAmount: parseNumber(value.pendingForApprovalAmount)
});
const computeStakeBalance = (value) => {
    const { approvedAmount, pendingApprovalAmount } = parseStakeInfo(value);
    return approvedAmount.add(pendingApprovalAmount);
};
const multiCallerFactory = (network, provider, blockTag) => (abi) => new utils_1.Multicaller(network, provider, abi, { blockTag });
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { stakingAddress, stakeMapIndex } = options;
    const initMultiCaller = multiCallerFactory(network, provider, blockTag);
    const stakingInfoCaller = initMultiCaller(stakingAbi);
    addresses.forEach((address) => {
        stakingInfoCaller.call(address, stakingAddress, 'getStakeInfo', [
            stakeMapIndex,
            address
        ]);
    });
    const stakingInfoResult = await stakingInfoCaller.execute();
    return Object.fromEntries(addresses.map((address) => {
        const stakeBalance = computeStakeBalance(stakingInfoResult[address]);
        return [address, parseFloat((0, units_1.formatUnits)(stakeBalance, options.decimals))];
    }));
}
exports.strategy = strategy;
