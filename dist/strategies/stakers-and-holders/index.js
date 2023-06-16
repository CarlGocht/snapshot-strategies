"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'tony31913';
exports.version = '0.1.0';
const stakingAbi = [
    'function depositsOf(address account) public view returns (uint256[] memory)'
];
const tokenAbi = [
    'function balanceOf(address owner) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingPool = new utils_1.Multicaller(network, provider, stakingAbi, {
        blockTag
    });
    const tokenPool = new utils_1.Multicaller(network, provider, tokenAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        stakingPool.call(address, options.staking, 'depositsOf', [address]);
        tokenPool.call(address, options.token, 'balanceOf', [address]);
    });
    const [stakingResponse, tokenResponse] = await Promise.all([stakingPool.execute(), tokenPool.execute()]);
    return Object.fromEntries(addresses.map((address) => {
        const stakingCount = stakingResponse[address].length;
        const tokenCount = bignumber_1.BigNumber.from(tokenResponse[address]).toNumber();
        return [address, stakingCount + tokenCount];
    }));
}
exports.strategy = strategy;
