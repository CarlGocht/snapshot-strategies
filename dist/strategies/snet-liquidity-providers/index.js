"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Vivek205';
exports.version = '0.1.0';
const erc20Abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint)'
];
const parseNumber = (value) => bignumber_1.BigNumber.from(value);
const computeTokenContribution = (lpBalance, lpTotalSupply, contractTokenBalance) => {
    lpTotalSupply = lpTotalSupply.isZero() ? bignumber_1.BigNumber.from(1) : lpTotalSupply;
    const tokenContribution = lpBalance
        .mul(contractTokenBalance)
        .div(lpTotalSupply);
    return tokenContribution;
};
const multiCallerFactory = (network, provider, blockTag) => (abi) => new utils_1.Multicaller(network, provider, abi, { blockTag });
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { address: tokenAddress, lpAddress } = options;
    const initMultiCaller = multiCallerFactory(network, provider, blockTag);
    const lpBalanceCaller = initMultiCaller(erc20Abi);
    const lpTotalSupplyCaller = initMultiCaller(erc20Abi);
    addresses.forEach((address) => {
        lpBalanceCaller.call(address, lpAddress, 'balanceOf', [address]);
        lpTotalSupplyCaller.call(address, lpAddress, 'totalSupply', []);
    });
    const contractBalanceCall = () => (0, utils_1.call)(provider, erc20Abi, [tokenAddress, 'balanceOf', [lpAddress]]);
    const [lpBalanceResult, lpTotalSupplyResult, contractBalanceResult] = await Promise.all([
        lpBalanceCaller.execute(),
        lpTotalSupplyCaller.execute(),
        contractBalanceCall()
    ]);
    const contractTokenBalance = parseNumber(contractBalanceResult);
    return Object.fromEntries(addresses.map((address) => {
        const lpBalance = parseNumber(lpBalanceResult[address]);
        const lpTotalSupply = parseNumber(lpTotalSupplyResult[address]);
        const senderTokenShare = computeTokenContribution(lpBalance, lpTotalSupply, contractTokenBalance);
        return [
            address,
            parseFloat((0, units_1.formatUnits)(senderTokenShare, options.lpDecimals))
        ];
    }));
}
exports.strategy = strategy;
