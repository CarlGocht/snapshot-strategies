"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const { getAddress } = require('@ethersproject/address');
exports.author = 'starsharks';
exports.version = '0.1.0';
const API_URLS = {
    56: 'https://www.starsharks.com/go/api/stake/vote-weight',
    97: 'https://develop.sharkshake.net/go/api/stake/vote-weight'
};
async function getAddressesDespoits({ addresses, block_id, network }) {
    const res = await (0, cross_fetch_1.default)(API_URLS[network], {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accounts: addresses,
            block_id
        })
    });
    const data = (await res.json());
    return data.data;
}
function calcPowerByDeposits(deposits, blockTime) {
    let power = 0;
    for (const deposit of deposits) {
        const { vesss_amount, begin_at, end_at } = deposit;
        if (begin_at < blockTime && end_at > blockTime) {
            const remainTimePercent = (end_at - blockTime) / (end_at - begin_at);
            const increment = Number((0, units_1.formatUnits)(vesss_amount)) * remainTimePercent;
            power += increment;
        }
    }
    return power;
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const block_id = typeof snapshot === 'number' ? snapshot : 0;
    const block = await provider.getBlock('latest');
    const blockTime = block.timestamp;
    const { chainId } = options;
    const depositsMap = await getAddressesDespoits({
        addresses,
        block_id,
        network: chainId ?? network
    });
    const result = {};
    for (const address in depositsMap) {
        const deposits = depositsMap[address];
        result[getAddress(address)] = calcPowerByDeposits(deposits, blockTime);
    }
    return result;
}
exports.strategy = strategy;
