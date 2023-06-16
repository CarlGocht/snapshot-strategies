"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'npbroo';
exports.version = '0.1.0';
const ERC20_ABI = [
    'function balanceOf(address account) external view returns (uint256)'
];
const STAKING_ABI = [
    'function getStakedTokens(address _owner) external view returns (uint16[] memory)',
    'function currentRewardsOf(uint16 _tokenId) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingPool = new utils_1.Multicaller(network, provider, STAKING_ABI, {
        blockTag
    });
    const tokenPool = new utils_1.Multicaller(network, provider, ERC20_ABI, {
        blockTag
    });
    addresses.forEach((address) => {
        stakingPool.call(address, options.staking, 'getStakedTokens', [address]);
        tokenPool.call(address, options.token, 'balanceOf', [address]);
    });
    const [stakingResponse, tokenResponse] = await Promise.all([stakingPool.execute(), tokenPool.execute()]);
    addresses.forEach((address) => {
        stakingResponse[address].forEach((id) => {
            stakingPool.call(id, options.staking, 'currentRewardsOf', [id]);
        });
    });
    const stakedRewardsResponse = await stakingPool.execute();
    return Object.fromEntries(addresses.map((address) => {
        const claimedCount = parseInt((0, units_1.formatUnits)(bignumber_1.BigNumber.from(tokenResponse[address]), options.decimals));
        let total_staked_reward = 0;
        stakingResponse[address].forEach((id) => {
            total_staked_reward += parseInt((0, units_1.formatUnits)(bignumber_1.BigNumber.from(stakedRewardsResponse[id]), options.decimals));
        });
        return [address, claimedCount + total_staked_reward];
    }));
}
exports.strategy = strategy;
