"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'rocket-pool';
exports.version = '0.1.1';
const rocketNodeStakingAddress = '0x3019227b2b8493e45Bf5d25302139c9a2713BF15';
const rocketNodeStakingContractAbi = [
    'function getNodeEffectiveRPLStake(address _nodeAddress) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const effectiveStake = new utils_1.Multicaller(network, provider, rocketNodeStakingContractAbi, { blockTag });
    addresses.forEach((address) => {
        effectiveStake.call(address, rocketNodeStakingAddress, 'getNodeEffectiveRPLStake', [address]);
    });
    const effectiveStakeResponse = await effectiveStake.execute();
    return Object.fromEntries(Object.entries(effectiveStakeResponse).map(([address, balance]) => [
        address,
        Math.sqrt(parseFloat((0, units_1.formatUnits)(balance, options.decimals))) / 2
    ]));
}
exports.strategy = strategy;
