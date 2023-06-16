"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bytes_1 = require("@ethersproject/bytes");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'joehquak';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function totalSupply() external view returns (uint256)',
    'function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // fetch all token and lp contract data
    const fetchContractData = await (0, utils_1.multicall)(network, provider, abi, [
        [options.lpTokenAddress, 'token0', []],
        [options.lpTokenAddress, 'token1', []],
        [options.lpTokenAddress, 'getReserves', []],
        [options.lpTokenAddress, 'totalSupply', []],
        [options.lpTokenAddress, 'decimals', []],
        [options.tokenAddress, 'decimals', []]
    ], { blockTag });
    // assign multicall data to variables
    const token0Address = fetchContractData[0][0];
    const token1Address = fetchContractData[1][0];
    const lpTokenReserves = fetchContractData[2];
    const lpTokenTotalSupply = fetchContractData[3][0];
    const lpTokenDecimals = fetchContractData[4][0];
    const tokenDecimals = fetchContractData[5][0];
    // calculate single lp token weight
    let tokenWeight;
    if (token0Address === options.tokenAddress) {
        tokenWeight =
            (parseFloat((0, units_1.formatUnits)(lpTokenReserves._reserve0, tokenDecimals)) /
                parseFloat((0, units_1.formatUnits)(lpTokenTotalSupply, lpTokenDecimals))) *
                2;
    }
    else if (token1Address === options.tokenAddress) {
        tokenWeight =
            (parseFloat((0, units_1.formatUnits)(lpTokenReserves._reserve1, tokenDecimals)) /
                parseFloat((0, units_1.formatUnits)(lpTokenTotalSupply, lpTokenDecimals))) *
                2;
    }
    else {
        tokenWeight = 0;
    }
    // get the number of crucibles owned by the wallet
    // wallet_address => crucible_count
    const callWalletToCrucibleCount = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToCrucibleCount.call(walletAddress, options.crucibleFactory, 'balanceOf', [walletAddress]);
    }
    const walletToCrucibleCount = await callWalletToCrucibleCount.execute();
    // get the address of each crucible
    // wallet_address : crucible_index => crucible_address
    const callWalletToCrucibleAddresses = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, crucibleCount] of Object.entries(walletToCrucibleCount)) {
        for (let index = 0; index < crucibleCount.toNumber(); index++) {
            callWalletToCrucibleAddresses.call(walletAddress.toString() + '-' + index.toString(), options.crucibleFactory, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToCrucibleAddresses = await callWalletToCrucibleAddresses.execute();
    // get the lp token balance of each crucible
    // crucible_address => lp_balance
    const callCrucibleToLpBalance = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletID, crucibleAddress] of Object.entries(walletIDToCrucibleAddresses)) {
        callCrucibleToLpBalance.call(walletID, options.lpTokenAddress, 'balanceOf', [(0, bytes_1.hexZeroPad)(crucibleAddress.toHexString(), 20)]);
    }
    const walletIDToLpBalance = await callCrucibleToLpBalance.execute();
    // get the token balance of each crucible
    // crucible_address => token_balance
    const callCrucibleToTokenBalance = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletID, crucibleAddress] of Object.entries(walletIDToCrucibleAddresses)) {
        callCrucibleToTokenBalance.call(walletID, options.tokenAddress, 'balanceOf', [(0, bytes_1.hexZeroPad)(crucibleAddress.toHexString(), 20)]);
    }
    const walletIDToTokenBalance = await callCrucibleToTokenBalance.execute();
    // sum the amount of LP tokens held across all crucibles
    // wallet_address => lp_balance
    const walletToLpBalance = {};
    for (const [walletID, lpBalance] of Object.entries(walletIDToLpBalance)) {
        const address = walletID.split('-')[0];
        walletToLpBalance[address] = walletToLpBalance[address]
            ? walletToLpBalance[address].add(lpBalance)
            : lpBalance;
    }
    // sum the amount of tokens held across all crucibles
    // wallet_address => token_balance
    const walletToTokenBalance = {};
    for (const [walletID, tokenBalance] of Object.entries(walletIDToTokenBalance)) {
        const address = walletID.split('-')[0];
        walletToTokenBalance[address] = walletToTokenBalance[address]
            ? walletToTokenBalance[address].add(tokenBalance)
            : tokenBalance;
    }
    return Object.fromEntries(Object.entries(walletToLpBalance).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, lpTokenDecimals)) * tokenWeight +
            parseFloat((0, units_1.formatUnits)(walletToTokenBalance[address], tokenDecimals))
    ]));
}
exports.strategy = strategy;
