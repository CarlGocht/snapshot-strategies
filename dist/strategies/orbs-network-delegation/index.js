"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'gadcl';
exports.version = '0.1.2';
const abi = [
    'function getDelegatedStake(address addr) external view returns (uint256)',
    'function getDelegationInfo(address addr) external view returns (address delegation, uint256 delegatorStake)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'getDelegatedStake', [address]));
    const delegations = await multi.execute();
    Object.entries(delegations)
        .filter(([, delegatedStake]) => bignumber_1.BigNumber.from(0).eq(delegatedStake))
        .forEach(([address]) => multi.call(address, options.address, 'getDelegationInfo', [address]));
    const override = await multi.execute();
    Object.entries(override).forEach(([address, [delegation, delegatorStake]]) => {
        const from = (0, address_1.getAddress)(address);
        const to = (0, address_1.getAddress)(delegation);
        delegations[from] = delegatorStake;
        if (delegations[to] && !override[to]) {
            delegations[to] = bignumber_1.BigNumber.from(delegations[to]).sub(delegatorStake);
        }
    });
    return Object.fromEntries(Object.entries(delegations).map(([address, delegatedStake]) => [
        (0, address_1.getAddress)(address),
        parseFloat((0, units_1.formatUnits)(delegatedStake, options.decimals))
    ]));
}
exports.strategy = strategy;
