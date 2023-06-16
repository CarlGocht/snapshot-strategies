"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'fextr';
exports.version = '1.0.1';
const zunamiSnapshotHelperAbi = [
    'function aggregatedBalanceOf(address _account) external view returns (uint256)'
];
const fraxStakingAbi = [
    'function lockedLiquidityOf(address account) external view returns (uint256)'
];
const curveAbi = ['function get_virtual_price() view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const lpPrice = parseFloat((0, units_1.formatUnits)(await (0, utils_1.call)(provider, curveAbi, [options.curvePoolAddress, 'get_virtual_price'], { blockTag }), options.lpPriceDecimals));
    const blackListAddressesArr = Array.from(options.blackListAddresses).map((address) => address.toLowerCase());
    const filteredAddresses = addresses.filter((address) => !blackListAddressesArr.includes(address.toLowerCase()));
    const aggregatedResult = await getAggregatedBalance(network, provider, blockTag, filteredAddresses, options.address);
    const fraxStakingResult = await getFraxStakingBalance(network, provider, blockTag, filteredAddresses, options.fraxStakingAddress);
    const result = mergeResults(aggregatedResult, fraxStakingResult);
    return Object.fromEntries(result.map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals)) * lpPrice
    ]));
}
exports.strategy = strategy;
async function getFraxStakingBalance(network, provider, blockTag, filteredAddresses, fraxStakingAddress) {
    const fraxStakingMulti = new utils_1.Multicaller(network, provider, fraxStakingAbi, {
        blockTag
    });
    filteredAddresses.forEach((address) => fraxStakingMulti.call(address, fraxStakingAddress, 'lockedLiquidityOf', [
        address
    ]));
    const fraxStakingResult = await fraxStakingMulti.execute();
    return fraxStakingResult;
}
async function getAggregatedBalance(network, provider, blockTag, filteredAddresses, contractAddress) {
    const multi = new utils_1.Multicaller(network, provider, zunamiSnapshotHelperAbi, {
        blockTag
    });
    filteredAddresses.forEach((address) => multi.call(address, contractAddress, 'aggregatedBalanceOf', [address]));
    const aggregatedResult = await multi.execute();
    return aggregatedResult;
}
function mergeResults(aggregatedResult, fraxStakingResult) {
    const fraxStakingEntries = Object.entries(fraxStakingResult);
    const fraxStakingResultMap = new Map(fraxStakingEntries);
    const aggregatedPlusStaking = Object.entries(aggregatedResult).map(([address, balance]) => {
        const fraxStakingBalance = fraxStakingResultMap.get(address);
        if (fraxStakingBalance) {
            return [
                address,
                bignumber_1.BigNumber.from(balance).add(bignumber_1.BigNumber.from(fraxStakingBalance))
            ];
        }
        return [address, balance];
    });
    const aggregatedPluStakingMap = new Map(aggregatedPlusStaking);
    fraxStakingEntries.map(([address, balance]) => {
        if (!aggregatedPluStakingMap.has(address)) {
            aggregatedPlusStaking.push([address, balance]);
        }
    });
    return aggregatedPlusStaking;
}
