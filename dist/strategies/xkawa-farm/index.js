"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'drgorillamd';
exports.version = '1.0.0';
const abi = [
    'function userInfo(address,uint256) external view returns(uint256 amount,uint256,uint256,uint256)',
    'function balanceOf(address) external view returns(uint256)',
    'function getReserves() external view returns(uint112,uint112 reserve1,uint32)',
    'function totalSupply() external view returns(uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multi.call(address + '-staked', options.farm, 'userInfo', [address, '1']); // .amount: uint
        multi.call(address + '-balance', options.token, 'balanceOf', [address]); // uint
        multi.call(address + '-LPstaked', options.farm, 'userInfo', [address, '3']); // .amount: uint
    });
    // xKawa is token1
    multi.call('reserves', options.LPxKawa, 'getReserves', []); // .reserve1: uint
    multi.call('totalSupplyLP', options.LPxKawa, 'totalSupply', []); // uint
    const result = await multi.execute();
    return Object.fromEntries(addresses.map((adr) => {
        let bal = result[adr + '-staked']['amount'];
        bal = bal.add(result[adr + '-balance']);
        bal = bal.add(bignumber_1.BigNumber.from(result[adr + '-LPstaked']['amount'])
            .mul(result['reserves']['reserve1'])
            .div(result['totalSupplyLP']));
        return [adr, parseFloat((0, units_1.formatUnits)(bal, options.decimals))];
    }));
}
exports.strategy = strategy;
