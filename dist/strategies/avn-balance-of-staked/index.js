"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'andrew-frank';
exports.version = '0.1.1';
const AVT_ABI = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
const VR_ABI = [
    {
        inputs: [
            { internalType: 'uint8', name: 'node', type: 'uint8' },
            { internalType: 'address', name: 'staker', type: 'address' }
        ],
        name: 'getStakerBalance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
const NUM_NODES = 10;
// [0, 1, ... , 9] for convinience
const NODES_INDICES = Array.from(Array(NUM_NODES).keys());
const STAKES_MULTIPLIER = 1;
class EthCall {
    contract;
    method;
    args;
    constructor(contract, method, args) {
        this.contract = contract;
        this.method = method;
        this.args = args;
    }
    get ethCall() {
        return [this.contract, this.method, this.args];
    }
}
/** creates flat array of eth calls for each user's stake in each VR contract in each node */
function serializeVrMultiCalls(vr1Address, vr2Address, userAddresses) {
    // [ [0, 1, ... , 19],  [0, 1, ... , 19] , ..., [0, 1, ... 19], ... ]
    const userCalls = userAddresses.map((user) => {
        const method = 'getStakerBalance';
        // map to objects to prevent flatting eth call arrays
        const vr1Calls = NODES_INDICES.map((node) => new EthCall(vr1Address, method, [node, user]));
        const vr2Calls = NODES_INDICES.map((node) => new EthCall(vr2Address, method, [node, user]));
        // * [0-9] calls for each node in VR1
        // * [10-19] calls for each node in VR2
        return vr1Calls.concat(vr2Calls);
    });
    // flat it and map to a list of the call primitives
    const objCalls = userCalls.flat();
    return objCalls.map((obj) => obj.ethCall);
}
/** splits array into chunks */
function chunkArray(arr, length) {
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, (i += length)));
    }
    return chunks;
}
/** sums big numbers in array */
function sumNumbers(arr) {
    return arr.reduce((previus, current) => {
        return previus.add(current[0]);
    }, bignumber_1.BigNumber.from(0));
}
/**
 * Parses multicall response
 * @param response multicall response
 * @returns summed AVT staked for each user in every node in every VR contract
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseVrResponse(response, users) {
    return chunkArray(response, 2 * NUM_NODES).map(sumNumbers);
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // users AVTs
    const avtResponses = await (0, utils_1.multicall)(network, provider, AVT_ABI, addresses.map((address) => [
        options.tokenAddress,
        'balanceOf',
        [address]
    ]), { blockTag });
    const avtValues = avtResponses.map((value) => value[0]);
    // users AVT staked in VR contracts
    const vrMultiResponse = await (0, utils_1.multicall)(network, provider, VR_ABI, serializeVrMultiCalls(options.vrAddress, options.vr2Address, addresses), { blockTag });
    const stakes = parseVrResponse(vrMultiResponse, addresses);
    // calculate the scores
    const vrVotes = stakes.map((v) => v.mul(STAKES_MULTIPLIER));
    const scores = avtValues.map((value, i) => {
        return value.add(vrVotes[i]);
    });
    return Object.fromEntries(scores.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;