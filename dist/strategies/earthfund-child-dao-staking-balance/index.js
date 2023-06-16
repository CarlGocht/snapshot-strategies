"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'bonustrack';
exports.version = '0.1.1';
const abi = [
    'function userStakes(address _daoToken, address _user) external view returns(uint256 stakedAmount, uint256 rewardEntry, uint256 pendingRewards, uint256 timeStaked)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.stakingRewardsContractAddress, 'userStakes', [
        options.childDaoTokenAddress,
        address
    ]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, userStake]) => [
        address,
        parseFloat((0, units_1.formatEther)(userStake[0])) // staked balance is the first item in the returned tuple from the contract call
    ]));
}
exports.strategy = strategy;
