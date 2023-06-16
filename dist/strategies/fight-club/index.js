"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'MantisClone';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function balanceOf(address account, uint256 id) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    // Arbitrary limit to avoid memory issues
    const limit = 10;
    if (options.gloveAddresses.length > limit) {
        throw new Error(`Number of glove addresses ${options.gloveAddresses.length} exceeds limit ${limit}`);
    }
    if (options.weightClassIds.length > limit) {
        throw new Error(`Number of weight class IDs ${options.weightClassIds.length} exceeds limit ${limit}`);
    }
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    Object.entries(options.gloveAddresses).forEach(([gloveAddress]) => {
        addresses.forEach((address) => {
            multi.call(`${address}.gloves.${gloveAddress}`, gloveAddress, 'balanceOf(address)', [address]);
        });
    });
    Object.entries(options.weightClassIds).forEach(([weightClassId]) => {
        addresses.forEach((address) => {
            multi.call(`${address}.weightClasses.${weightClassId}`, options.weightClassAddress, 'balanceOf(address, uint256)', [address, weightClassId]);
        });
    });
    const result = await multi.execute();
    // console.log('Multicall result');
    // console.dir(result, { depth: null });
    const weightedResult = Object.fromEntries(addresses.map((address) => [
        address,
        {
            gloves: Object.fromEntries(Object.entries(result[address].gloves).map(([gloveAddress, numGloves]) => {
                const hasGlove = numGloves.gte(1) ? 1 : 0;
                return [
                    gloveAddress,
                    hasGlove * options.gloveAddresses[gloveAddress]
                ];
            })),
            weightClasses: Object.fromEntries(Object.entries(result[address].weightClasses).map(([weightClassId, numKudos]) => {
                const hasKudo = numKudos.gte(1) ? 1 : 0;
                return [
                    weightClassId,
                    hasKudo * options.weightClassIds[weightClassId]
                ];
            }))
        }
    ]));
    // console.log('Weighted result');
    // console.dir(weightedResult, { depth: null });
    return Object.fromEntries(addresses.map((address) => {
        // Only the glove with the highest associated weight is counted.
        // Total vote score is 0 if voter has no gloves.
        const maxGlove = Math.max(...Object.values(weightedResult[address].gloves));
        // Only the weight class Kudo with the highest associated weight is counted.
        // Weight class multiplier defaults to 1 if voter has no weight class Kudos.
        const maxWeightClass = Math.max(...Object.values(weightedResult[address].weightClasses)) || 1;
        return [address, maxGlove * maxWeightClass];
    }));
}
exports.strategy = strategy;
