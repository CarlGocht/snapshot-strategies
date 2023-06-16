"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructExitPoolRequest = exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const contracts_1 = require("@ethersproject/contracts");
const abi_1 = require("@ethersproject/abi");
const erc20_balance_of_1 = require("../erc20-balance-of");
const address_1 = require("@ethersproject/address");
exports.author = 'paraswap';
exports.version = '0.1.0';
const BalancerVaultAbi = [
    'function getPoolTokens(bytes32 poolId) external view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)'
];
const BalancerHelpersAbi = [
    'function queryExit(bytes32 poolId, address sender, address recipient, tuple(address[] assets, uint256[] minAmountsOut, bytes userData, bool toInternalBalance) request) returns (uint256 bptIn, uint256[] amountsOut)'
];
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const account2BPTBalance = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options.sePSP2, snapshot);
    const balancerVault = new contracts_1.Contract(options.balancer.Vault, BalancerVaultAbi, provider);
    const { tokens: poolTokens } = await balancerVault.getPoolTokens(options.balancer.poolId, { blockTag });
    const tokenLowercase = options.address.toLowerCase();
    const tokenIndex = poolTokens.findIndex((token) => token.toLowerCase() === tokenLowercase);
    if (tokenIndex === -1) {
        throw new Error(`Token ${options.address} doesn't belong to Balancer Pool ${options.balancer.poolId}`);
    }
    const balancerHelpers = new contracts_1.Contract(options.balancer.BalancerHelpers, BalancerHelpersAbi, provider);
    const exitPoolRequest = constructExitPoolRequest(poolTokens, 
    // how much will get for 1 BPT
    (0, units_1.parseUnits)('1', options.sePSP2.decimals));
    const queryExitResult = await balancerHelpers.callStatic.queryExit(options.balancer.poolId, ZERO_ADDRESS, ZERO_ADDRESS, exitPoolRequest, { blockTag });
    const pspFor1BPT = parseFloat((0, units_1.formatUnits)(queryExitResult.amountsOut[tokenIndex], options.decimals));
    const address2PSPinSePSP2 = Object.fromEntries(Object.entries(account2BPTBalance).map(([address, bptBalance]) => {
        const pspBalance = pspFor1BPT * bptBalance;
        const checksummedAddress = (0, address_1.getAddress)(address);
        return [checksummedAddress, pspBalance * options.multiplier];
    }));
    return address2PSPinSePSP2;
}
exports.strategy = strategy;
// ExitKind enum for BalancerHerlpers.queryExit call
const EXACT_BPT_IN_FOR_TOKENS_OUT = 1;
function constructExitPoolRequest(assets, bptAmountIn) {
    const abi = ['uint256', 'uint256'];
    const data = [EXACT_BPT_IN_FOR_TOKENS_OUT, bptAmountIn];
    const userData = abi_1.defaultAbiCoder.encode(abi, data);
    const minAmountsOut = assets.map(() => 0);
    return {
        assets,
        minAmountsOut,
        userData,
        toInternalBalance: false
    };
}
exports.constructExitPoolRequest = constructExitPoolRequest;
