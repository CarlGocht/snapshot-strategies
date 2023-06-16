"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
const utils_1 = require("../../utils");
exports.author = 'kibagateaux';
exports.version = '0.1.0';
const abi = ['function totalSupply() public returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const poolShares = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const poolGovTokens = (await (0, erc20_balance_of_1.strategy)(space, network, provider, [options.pool], { ...options, address: options.governanceToken }, snapshot))[options.pool];
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const totalPoolShares = await (0, utils_1.multicall)(network, provider, abi, [[options.address, 'totalSupply']], { blockTag });
    if (!totalPoolShares || !poolGovTokens || !Object.keys(poolShares).length)
        return {};
    const totalShares = parseFloat((0, units_1.formatUnits)(totalPoolShares.toString(), options.decimals));
    return Object.fromEntries(Object.entries(poolShares).map((account) => [
        account[0],
        (account[1] / totalShares) * poolGovTokens
    ]));
}
exports.strategy = strategy;
