"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'paraswap';
exports.version = '0.1.0';
const abi = [
    'function PSPBalance(address _account) view returns (uint256 pspAmount_)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    options.SPSPs.forEach((SPSP) => {
        addresses.forEach((address) => {
            const path = `${SPSP}_${address}`;
            // calls SPSP.PSPBalance(address)
            // and puts into {`${SPSP}_${address}`: balance} in result
            return multi.call(path, SPSP, 'PSPBalance', [address]);
        });
    });
    const result = await multi.execute();
    const pspByAddress = Object.entries(result).reduce((accum, [path, balance]) => {
        const [, address] = path.split('_');
        if (!accum[address]) {
            accum[address] = bignumber_1.BigNumber.from(0);
        }
        accum[address] = accum[address].add(balance);
        return accum;
    }, {});
    return Object.fromEntries(Object.entries(pspByAddress).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
