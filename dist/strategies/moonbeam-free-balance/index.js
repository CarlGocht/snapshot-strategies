"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.readLittleEndianBigInt = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const web_1 = require("@ethersproject/web");
const blakejs_1 = require("blakejs");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'crystalin';
exports.version = '0.1.0';
function readLittleEndianBigInt(hex) {
    return BigInt(`0x${hex.match(/../g)?.reverse().join('')}`);
}
exports.readLittleEndianBigInt = readLittleEndianBigInt;
function processPayload(payload) {
    if (payload.error) {
        const error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    // Retrieve the blockhash for the snapshot
    const { result: blockHash } = await (0, web_1.fetchJson)(provider.connection, JSON.stringify({
        method: 'chain_getBlockHash',
        params: typeof snapshot === 'number' ? [snapshot] : [],
        id: 0,
        jsonrpc: '2.0'
    }), processPayload);
    // Pre-encoded key prefix for "system.account" storage
    const accountPrefix = `0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9`;
    const { decimals } = options;
    const batchSize = 100;
    const batches = addresses.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / batchSize);
        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }
        resultArray[chunkIndex].push(item);
        return resultArray;
    }, []);
    // Stores all the retrieved balances
    const balances = {};
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const addressBatch = batches[batchIndex];
        // Convert address to storage key.
        const keys = await Promise.all(addressBatch.map(async (address) => `${accountPrefix}${await (0, blakejs_1.blake2bHex)(Buffer.from(address.substring(2), 'hex'), undefined, 16)}${address.substring(2)}`));
        // Build batch request for all the storage keys of the batch.
        const reqs = keys.map((key, index) => ({
            method: 'state_getStorage',
            params: [key, blockHash],
            id: batchIndex * batchSize + index + 1,
            jsonrpc: '2.0'
        }));
        // Query batch of storage items
        const payloads = await (0, web_1.fetchJson)(provider.connection, JSON.stringify(reqs), processPayload);
        for (const payload of payloads) {
            if (payload.result === null) {
                break;
            }
            // Computes "system.account" key for given address
            // Retrieves storage data for the "system.account" key
            // account data structure (little endian):
            // {
            //   nonce: 8 bits
            //   consumers: 8 bits
            //   providers: 8 bits
            //   sufficients: 8 bits
            //   data: {
            //     free: 32 bits
            //     reserved: 32 bits
            //     miscFrozen: 32 bits
            //     feeFrozen: 32 bits
            //   }
            // }
            // Converts the bigint into number.
            // Result won't be precise, but should be lower than real value.
            const free = payload.result.length >= 2 + 8 + 8 + 8 + 8 + 32
                ? parseFloat((0, bignumber_1.formatFixed)(readLittleEndianBigInt(payload.result.substring(2 + 8 + 8 + 8 + 8, 2 + 8 + 8 + 8 + 8 + 32)), decimals))
                : 0;
            balances[(0, address_1.getAddress)(addressBatch[(payload.id - 1) % batchSize])] = free;
        }
    }
    return balances;
}
exports.strategy = strategy;
