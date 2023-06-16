"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Charles-repo';
exports.version = '0.1.2';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function token0() external view returns (address)',
    'function getReserves() external view returns (uint112, uint112, uint32)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'balanceOf', [address]));
    const result = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.veaddress, 'balanceOf', [address]));
    const veresult = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.lpaddress, 'balanceOf', [address]));
    const resultLP1 = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.harvaddress, 'balanceOf', [address]));
    const resultLP2 = await multi.execute();
    multi.call('token0', options.lpaddress, 'token0', []);
    multi.call('getReserves', options.lpaddress, 'getReserves', []);
    multi.call('totalSupply', options.lpaddress, 'totalSupply', []);
    const { token0, getReserves, totalSupply } = await multi.execute();
    let totalGnomeAmount;
    if (token0.toLowerCase() === options.address.toLowerCase()) {
        totalGnomeAmount = getReserves[0];
    }
    else {
        totalGnomeAmount = getReserves[1];
    }
    return Object.fromEntries(Object.entries(resultLP1).map(([address, balance]) => {
        let bal = bignumber_1.BigNumber.from(balance)
            .add(resultLP2[address])
            .mul(totalGnomeAmount)
            .div(totalSupply);
        bal = bal
            .add(result[address])
            .add(bignumber_1.BigNumber.from(veresult[address]).mul(5));
        return [address, parseFloat((0, units_1.formatUnits)(bal, options.decimals))];
    }));
}
exports.strategy = strategy;
