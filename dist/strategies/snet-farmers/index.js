"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Vivek205';
exports.version = '0.1.0';
const farmingAbi = [
    'function userInfo(uint256 poolid, address account) external view returns (uint256 amount, int256 rewardDebt)'
];
const parseNumber = (value) => bignumber_1.BigNumber.from(value);
const multiCallerFactory = (network, provider, blockTag) => (abi) => new utils_1.Multicaller(network, provider, abi, { blockTag });
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { farmingAddress, farmingPoolId } = options;
    const initMultiCaller = multiCallerFactory(network, provider, blockTag);
    const farmingInfoCaller = initMultiCaller(farmingAbi);
    addresses.forEach((address) => {
        farmingInfoCaller.call(address, farmingAddress, 'userInfo', [
            farmingPoolId,
            address
        ]);
    });
    const farmingInfoResult = await farmingInfoCaller.execute();
    return Object.fromEntries(addresses.map((address) => {
        const farmingBalance = parseNumber(farmingInfoResult[address].amount);
        return [
            address,
            parseFloat((0, units_1.formatUnits)(farmingBalance, options.decimals))
        ];
    }));
}
exports.strategy = strategy;
