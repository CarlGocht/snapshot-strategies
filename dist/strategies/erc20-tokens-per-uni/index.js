"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'programmablewealth';
exports.version = '0.0.1';
const tokenAbi = [
    'function balanceOf(address account) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const poolTokensBalanceQueries = addresses.map((address) => [
        options.poolTokenAddress,
        'balanceOf',
        [address]
    ]);
    const res = await (0, utils_1.multicall)(network, provider, tokenAbi, [
        ...poolTokensBalanceQueries,
        [options.poolTokenAddress, 'totalSupply', []],
        [options.erc20TokenAddress, 'balanceOf', [options.poolTokenAddress]]
    ], { blockTag });
    const tokensPerUni = (balanceInUni, totalSupply) => {
        return balanceInUni / 1e18 / (totalSupply / 1e18);
    };
    const entries = {};
    for (let addressIndex = 0; addressIndex < addresses.length; addressIndex++) {
        const address = addresses[addressIndex];
        const result = res[addressIndex] *
            tokensPerUni(res[poolTokensBalanceQueries.length + 1], res[poolTokensBalanceQueries.length]);
        entries[address] = Number(result.toString()) / 1e18;
    }
    return entries;
}
exports.strategy = strategy;
