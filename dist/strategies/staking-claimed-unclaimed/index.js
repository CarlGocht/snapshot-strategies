"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'ZombieDAODev';
exports.version = '0.1.0';
const stakingAbi = [
    'function depositsOf(address account) public view returns (uint256[] memory)',
    'function calculateRewards(address account, uint256[] tokenIds) public view returns (uint256[] memory)'
];
const tokenAbi = [
    'function balanceOf(address owner) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingPool = new utils_1.Multicaller(network, provider, stakingAbi, {
        blockTag
    });
    const tokenPool = new utils_1.Multicaller(network, provider, tokenAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        stakingPool.call(address, options.staking, 'depositsOf', [address]);
        tokenPool.call(address, options.token, 'balanceOf', [address]);
    });
    const [stakingResponse, tokenResponse] = await Promise.all([stakingPool.execute(), tokenPool.execute()]);
    addresses.forEach((address) => {
        const tokenIds = stakingResponse[address].map((tokenId) => bignumber_1.BigNumber.from(tokenId).toNumber());
        stakingPool.call(address, options.staking, 'calculateRewards', [
            address,
            tokenIds
        ]);
    });
    const rewardsResponse = await stakingPool.execute();
    return Object.fromEntries(addresses.map((address) => {
        const claimedCount = (0, units_1.formatEther)(bignumber_1.BigNumber.from(tokenResponse[address]));
        const unclaimedCount = (0, units_1.formatEther)(rewardsResponse[address].reduce((prev, count) => bignumber_1.BigNumber.from(prev).add(bignumber_1.BigNumber.from(count)), bignumber_1.BigNumber.from('0')));
        return [address, parseInt(claimedCount) + parseInt(unclaimedCount)];
    }));
}
exports.strategy = strategy;
