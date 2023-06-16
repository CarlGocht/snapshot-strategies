"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'MantisClone';
exports.version = '0.1.0';
const abi = [
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function getUnderlyingBalances() external view returns (uint256 amount0Current, uint256 amount1Current)',
    'function totalSupply() public view returns (uint256)',
    ,
    'function balanceOf(address account) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('token0', options.poolAddress, 'token0', []);
    multi.call('token1', options.poolAddress, 'token1', []);
    multi.call('underlyingBalances', options.poolAddress, 'getUnderlyingBalances', []);
    multi.call('lpTokenTotalSupply', options.poolAddress, 'totalSupply', []);
    addresses.forEach((address) => multi.call(`lpTokenBalances.${address}`, options.poolAddress, 'balanceOf', [
        address
    ]));
    const result = await multi.execute();
    const token0 = result.token0;
    const token1 = result.token1;
    const underlyingBalances = result.underlyingBalances;
    const lpTotalSupply = result.lpTokenTotalSupply;
    const lpBalances = result.lpTokenBalances;
    let underlyingBalance;
    if (options.tokenAddress === token0) {
        underlyingBalance = underlyingBalances[0];
    }
    else if (options.tokenAddress === token1) {
        underlyingBalance = underlyingBalances[1];
    }
    else {
        throw new Error(`token not in pool. poolAddress=${options.poolAddress}, tokenAddress=${options.tokenAddress}`);
    }
    return Object.fromEntries(Object.entries(lpBalances).map(([address, lpBalance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(underlyingBalance.mul(lpBalance).div(lpTotalSupply), options.decimals))
    ]));
}
exports.strategy = strategy;
