"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const snapshot_js_1 = __importDefault(require("@snapshot-labs/snapshot.js"));
exports.author = 'victor-kyriazakos';
exports.version = '0.1.0';
const abi = [
    'function ownerOf(uint256 tokenId) public view returns (address owner)'
];
// flattens the [{ "id": weight }] array into {ids[], weights[]} array
const flattenTokenIdWeightMetadata = (tokenIdWeightMetadata) => {
    const tokenData = tokenIdWeightMetadata.map((tokenDato) => {
        const ids = [], weights = [];
        let datoId;
        const keys = Object.keys(tokenDato);
        if (keys.length > 0) {
            datoId = parseInt(keys[0]);
            ids.push(datoId);
            weights.push(tokenDato[datoId.toString()]);
        }
        return { ids, weights };
    });
    return tokenData.reduce((prev, curr) => ({
        ids: [...prev.ids, ...curr.ids],
        weights: [...prev.weights, ...curr.weights]
    }));
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const batchSize = 8000;
    const maximumAllowedRange = 32000; // batchSize * 4
    let customRangeBalance = {};
    // 1st, get all metadata values from the source - token weights
    const metadata = await snapshot_js_1.default.utils.getJSON(options.metadataSrc);
    if (metadata.length > maximumAllowedRange)
        throw new Error(`Range is too big, the maximum allowed combined range is ${maximumAllowedRange}`);
    const getDataFromBlockChain = async (contractCalls) => (0, utils_1.multicall)(network, provider, abi, contractCalls, { blockTag });
    const filterUnusedAddresses = (addressesToFilter) => addressesToFilter.filter((address) => addresses
        .map((address) => address.toLowerCase())
        .includes(address.toLowerCase()));
    const multiplyOccurrencesByWeights = (contractCallResponse, weights) => contractCallResponse
        .map((address, index) => Array(weights[index]).fill(address[0]))
        .flat();
    const countAndAccumulateOccurrences = (array) => (customRangeBalance = array.reduce((prev, curr) => (prev[curr] ? ++prev[curr] : (prev[curr] = 1), prev), customRangeBalance));
    const accumulateCustomRangeBalance = async ({ ids, weights }) => {
        // Define contract calls
        const contractCalls = ids.map((id) => [
            options.address,
            'ownerOf',
            [id]
        ]);
        // batch-call contract data
        const customRangeResponse = await getDataFromBlockChain(contractCalls);
        const customRangeResponseWeighted = multiplyOccurrencesByWeights(customRangeResponse, weights);
        const customRangeResponseWeightedFiltered = filterUnusedAddresses(customRangeResponseWeighted);
        return countAndAccumulateOccurrences(customRangeResponseWeightedFiltered);
    };
    const makeBatch = ({ batchSize }) => {
        const { ids, weights } = flattenTokenIdWeightMetadata(metadata);
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
    const batches = makeBatch({ batchSize: batchSize });
    for (let i = 0; i < batches.length; i++) {
        await accumulateCustomRangeBalance({ ...batches[i] });
    }
    return { ...customRangeBalance };
}
exports.strategy = strategy;
