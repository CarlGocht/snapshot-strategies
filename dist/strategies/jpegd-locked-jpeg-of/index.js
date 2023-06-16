"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
exports.author = '0xleez';
exports.version = '0.1.1';
const SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/jpegd/jpegd-core-mainnet'
};
const abi = [
    'function traitBoostPositions(uint256 _nftIndex) view returns (address owner, uint256 unlockAt, uint256 lockedValue)',
    'function ltvBoostPositions(uint256 _nftIndex) view returns (address owner, uint256 unlockAt, uint256 lockedValue)'
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const params = {
        jpeglocks: {
            __args: {
                where: {
                    owner_in: addresses.map((address) => address.toLowerCase())
                },
                block: blockTag != 'latest' ? { number: blockTag } : null
            },
            owner: { id: true },
            collection: { id: true, nftValueProviderAddress: true },
            type: true,
            nftIndex: true,
            amount: true,
            unlockTime: true
        }
    };
    const result = await (0, utils_2.subgraphRequest)(SUBGRAPH_URL[network], params);
    const jpegLocks = result.jpeglocks ?? [];
    const responses = await (0, utils_1.multicall)(network, provider, abi, jpegLocks.map((jpegLock) => [
        (0, address_1.getAddress)(jpegLock.collection.nftValueProviderAddress),
        jpegLock.type === 'LTV' ? 'ltvBoostPositions' : 'traitBoostPositions',
        [jpegLock.nftIndex]
    ]), { blockTag });
    return responses.reduce((acc, response, index) => {
        const jpegLock = jpegLocks[index];
        const address = (0, address_1.getAddress)(jpegLock.owner.id);
        if (!acc[address])
            acc[address] = 0;
        const lockedJpeg = Number((0, units_1.formatUnits)(response.lockedValue.toString(), 18));
        acc[address] += lockedJpeg;
        return acc;
    }, {});
}
exports.strategy = strategy;
