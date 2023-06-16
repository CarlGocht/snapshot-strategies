"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
exports.author = 'amptoken';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const apiUrl = `${options.apiBase}/accounts?addresses=${addresses.join(',')}&snapshot=${snapshot}`;
    const response = await (0, cross_fetch_1.default)(apiUrl, {
        method: 'GET',
        headers: {
            Accept: 'application/vnd.flexa.capacity.v1+json'
        }
    });
    const data = await response.json();
    return Object.fromEntries(data.map((value) => {
        const { supplyTotal = 0, rewardTotal = 0 } = value;
        return [
            (0, address_1.getAddress)(value.address),
            parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(supplyTotal).add(rewardTotal), 18))
        ];
    }));
}
exports.strategy = strategy;
