"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'shinitakunai';
exports.version = '0.1.0';
const abi = [
    'function getPoolTokens(bytes32 poolId) external view returns (address[], uint256[], uint256)',
    'function totalSupply() external view returns (uint256)',
    'function balances(address owner) external view returns (uint256)'
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('poolTokens', options.balancerVaultAddress, 'getPoolTokens', [
        options.poolId
    ]);
    multi.call('lpTokenTotalSupply', options.poolAddress, 'totalSupply', []);
    addresses.forEach((address) => multi.call(`userBalances.${address}`, options.farmAddress, 'balances', [
        address
    ]));
    const { poolTokens: [tokens, balances], lpTokenTotalSupply, userBalances } = await multi.execute();
    const vstaIndex = tokens.findIndex((address) => address.toLowerCase() === options.vstaAddress.toLowerCase());
    const vstaPerLp = balances[vstaIndex].div(lpTokenTotalSupply);
    const result = Object.fromEntries(Object.entries(userBalances).map(([address, lpBalance]) => [
        (0, address_1.getAddress)(address),
        parseFloat((0, units_1.formatUnits)(vstaPerLp.mul(lpBalance), options.decimals))
    ]));
    return result;
}
exports.strategy = strategy;
