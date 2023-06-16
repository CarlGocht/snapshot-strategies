"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'crypto-dump';
exports.version = '0.1.0';
const nftContractAbi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
const tokenContractAbi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function decimals() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const callTokenDecimal = () => {
        return (0, utils_1.call)(provider, tokenContractAbi, [
            options.tokenAddress,
            'decimals',
            []
        ]);
    };
    const makeMulticaller = (abi, contractAddress) => {
        const multiCaller = new utils_1.Multicaller(network, provider, abi, {
            blockTag
        });
        addresses.forEach((address) => multiCaller.call(address, contractAddress, 'balanceOf', [address]));
        return multiCaller;
    };
    const erc20Multi = makeMulticaller(tokenContractAbi, options.tokenAddress);
    const erc721Multi = makeMulticaller(nftContractAbi, options.nftAddress);
    const [tokenDecimal, tokenResults, nftResults] = await Promise.all([
        callTokenDecimal(),
        erc20Multi.execute(),
        erc721Multi.execute()
    ]);
    const scores = {};
    for (const address of addresses) {
        const tokenScore = bignumber_1.BigNumber.from(tokenResults[address] || 0);
        const nftScore = bignumber_1.BigNumber.from(nftResults[address] || 0)
            .mul(options.nftMultiplier)
            .mul(bignumber_1.BigNumber.from(10).pow(tokenDecimal));
        scores[address] = tokenScore.add(nftScore);
    }
    return Object.fromEntries(Object.entries(scores).map(([address, score]) => [
        address,
        parseFloat((0, units_1.formatUnits)(score, options.decimals))
    ]));
}
exports.strategy = strategy;
