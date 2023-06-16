"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc721_with_multiplier_1 = require("../erc721-with-multiplier");
const utils_1 = require("../../utils");
exports.author = 'FeSens';
exports.version = '0.2.0';
const abi = [
    'function ownerOf(uint256 tokenId) public view returns (address owner)'
];
const calculateRangeSize = (tokenIdWeightRanges) => {
    return tokenIdWeightRanges.reduce((prev, curr) => {
        const { start, end } = curr;
        if (start > end)
            throw new Error('Range start tokenID must always be equal or smaller than the final tokenID');
        prev += end - start + 1;
        return prev;
    }, 0);
};
const range = (start, end, step) => Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
const flattenTokenIdWeightRanges = (tokenIdWeightRanges) => {
    const ranges = tokenIdWeightRanges.map((tokenIdWeightRange) => {
        const { start, end, weight } = tokenIdWeightRange;
        const ids = range(start, end, 1);
        const weights = Array(ids.length).fill(weight);
        return { ids, weights };
    });
    return ranges.reduce((prev, curr) => ({
        ids: [...prev.ids, ...curr.ids],
        weights: [...prev.weights, ...curr.weights]
    }));
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { tokenIdWeightRanges, defaultWeight } = options;
    const maximumNumberOfBatches = 4;
    const batchSize = 8000;
    const maximumAllowedRange = maximumNumberOfBatches * batchSize;
    let erc721WeightedBalance = {};
    let customRangeBalance = {};
    if (calculateRangeSize(tokenIdWeightRanges) > maximumAllowedRange)
        throw new Error(`Range is too big, the maximum allowed combined range is ${maximumAllowedRange}`);
    const getDataFromBlockChain = async (contractCalls) => (0, utils_1.multicall)(network, provider, abi, contractCalls, { blockTag });
    const filterUnusedAddresses = (addressesToFilter) => addressesToFilter.filter((address) => addresses
        .map((address) => address.toLowerCase())
        .includes(address.toLowerCase()));
    const multiplyOccurrencesByWeights = async (contractCallResponse, weights) => contractCallResponse
        .map((address, index) => Array(weights[index]).fill(address[0]))
        .flat();
    const countAndAccumulateOccurrences = (array) => (customRangeBalance = array.reduce((prev, curr) => (prev[curr] ? ++prev[curr] : (prev[curr] = 1), prev), customRangeBalance));
    const accumulateCustomRangeBalance = async ({ ids, weights }) => {
        const contractCalls = ids.map((id) => [
            options.address,
            'ownerOf',
            [id]
        ]);
        const customRangeResponse = await getDataFromBlockChain(contractCalls);
        const customRangeResponseWeighted = await multiplyOccurrencesByWeights(customRangeResponse, weights);
        const customRangeResponseWeightedFiltered = filterUnusedAddresses(customRangeResponseWeighted);
        return countAndAccumulateOccurrences(customRangeResponseWeightedFiltered);
    };
    const makeBatch = ({ batchSize }) => {
        const { ids, weights } = flattenTokenIdWeightRanges(tokenIdWeightRanges);
        const batchedIds = [...Array(Math.ceil(ids.length / batchSize))].map(() => ids.splice(0, batchSize));
        const batchedWeights = [
            ...Array(Math.ceil(weights.length / batchSize))
        ].map(() => weights.splice(0, batchSize));
        const batches = batchedIds.map((e, i) => ({
            ids: e,
            weights: batchedWeights[i]
        }));
        return batches;
    };
    if (defaultWeight)
        erc721WeightedBalance = await (0, erc721_with_multiplier_1.strategy)(space, network, provider, addresses, { ...options, multiplier: defaultWeight }, snapshot);
    const batches = makeBatch({ batchSize: batchSize });
    for (let i = 0; i < batches.length; i++) {
        await accumulateCustomRangeBalance({ ...batches[i] });
    }
    return { ...erc721WeightedBalance, ...customRangeBalance };
}
exports.strategy = strategy;
