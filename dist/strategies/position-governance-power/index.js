"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'JustinPosition';
exports.version = '0.0.1';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
const stakeManagerAbi = [
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
];
const nftStakingPoolAbi = [
    'function balanceOf(address account) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        return multi.call(address, options.address, 'balanceOf', [address]);
    });
    const nftStakingBalances = await (0, utils_1.multicall)(network, provider, nftStakingPoolAbi, addresses.map((address) => [
        options.nftStakingPoolAddress,
        'balanceOf',
        [address]
    ]), { blockTag });
    const stakeBalances = await (0, utils_1.multicall)(network, provider, stakeManagerAbi, addresses.map((address) => [
        options.stakeManagerAddress,
        'userInfo',
        ['0', address]
    ]), { blockTag });
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance], index) => {
        return [
            address,
            parseFloat((0, units_1.formatUnits)(nftStakingBalances[index][0], options.decimals)) +
                parseFloat((0, units_1.formatUnits)(stakeBalances[index].amount, options.decimals)) +
                parseFloat((0, units_1.formatUnits)(balance, options.decimals))
        ];
    }));
}
exports.strategy = strategy;
