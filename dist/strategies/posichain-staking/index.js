"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'dannyposi';
exports.version = '0.0.1';
async function strategy(_space, _network, provider, 
// adding a 0 value for addresses not in the result is not needed
// since they are dropped anyway in utils.ts
// https://github.com/snapshot-labs/snapshot-strategies/blob/02439eb120ed7c4cc0c493924b78d92d22006b40/src/utils.ts#L26
_addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await provider.send('hmyv2_getValidatorsStakeByBlockNumber', [blockTag]);
    return Object.fromEntries(Object.entries(response).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from('0x' + balance.toString(16)), options && options.decimals ? options.decimals : 18))
    ]));
}
exports.strategy = strategy;
