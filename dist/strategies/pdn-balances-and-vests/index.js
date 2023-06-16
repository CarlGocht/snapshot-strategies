"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'viganzeqiri';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function getVestLength(address _address) public view returns(uint)',
    'function getVestMetaData(uint _index, address _address) public view returns(uint, uint)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'balanceOf', [address]));
    const balances = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.address, 'getVestLength', [address]));
    const addressesWithVestLength = await multi.execute();
    const formatedAddressVests = Object.entries(addressesWithVestLength).reduce((acc, [addresses, vestLength]) => {
        acc[addresses] = Number(vestLength);
        return acc;
    }, {});
    Object.entries(formatedAddressVests).forEach(([address, vestLength]) => {
        if (vestLength > 0) {
            const vestIndexes = Array.from(Array(vestLength).keys());
            vestIndexes.forEach((vestIndex) => {
                multi.call(`${address}-${vestIndex}`, options.address, 'getVestMetaData', [vestIndex, address]);
            });
        }
    });
    const vestsMetadata = await multi.execute();
    const metadataWithAccumulatedVests = Object.entries(vestsMetadata).reduce((acc, [key, value]) => {
        const [address] = key.split('-');
        const amountVestes = value[0] || 0;
        acc[address] =
            (acc[address] || 0) +
                parseFloat((0, units_1.formatUnits)(amountVestes, options.decimals));
        return acc;
    }, {});
    return Object.fromEntries(Object.entries(balances).map(([address, balance]) => {
        const totalBalance = (!!metadataWithAccumulatedVests[address]
            ? metadataWithAccumulatedVests[address]
            : 0) + parseFloat((0, units_1.formatUnits)(balance, options.decimals));
        return [address, totalBalance];
    }));
}
exports.strategy = strategy;
