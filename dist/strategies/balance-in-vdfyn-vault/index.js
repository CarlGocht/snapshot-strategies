"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'vatsalgupta13';
exports.version = '0.1.0';
function chunk(array, chunkSize) {
    const tempArray = [];
    for (let i = 0, len = array.length; i < len; i += chunkSize)
        tempArray.push(array.slice(i, i + chunkSize));
    return tempArray;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    let callData = [];
    const ratio = await (0, utils_1.call)(provider, options.methodABI, [
        options.contractAddress,
        'ratio',
        []
    ]);
    // console.log('ratio: ', ratio.toString());
    addresses.map((userAddress) => {
        callData.push([options.contractAddress, 'balanceOf', [userAddress]]);
    });
    callData = [...chunk(callData, 2000)]; // chunking the callData into multiple arrays of 2000 requests
    const response = [];
    for (let i = 0; i < callData.length; i++) {
        const tempArray = await (0, utils_1.multicall)(network, provider, options.methodABI, callData[i], { blockTag });
        response.push(...tempArray);
    }
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        options.scoreMultiplier *
            ratio *
            parseFloat((0, units_1.formatUnits)(value.toString(), 18))
    ]));
}
exports.strategy = strategy;
