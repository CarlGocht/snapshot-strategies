"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'PathDAO';
exports.version = '0.1.0';
const constAbi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const lockedAbi = options.methodABI;
    const stakingPool = new utils_1.Multicaller(network, provider, constAbi, {
        blockTag
    });
    const tokenPool = new utils_1.Multicaller(network, provider, constAbi, { blockTag });
    const lockedPool = new utils_1.Multicaller(network, provider, lockedAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        stakingPool.call(address, options.stakingAddress, 'balanceOf', [address]);
        tokenPool.call(address, options.tokenAddress, 'balanceOf', [address]);
    });
    addresses.forEach((address) => {
        for (let i = 0; i < options.lockedAddresses.length; i++) {
            lockedPool.call(`locked_${i}.${address}`, options.lockedAddresses[i], 'getRemainingAmount', [address]);
        }
    });
    const [stakingResponse, tokenResponse] = await Promise.all([stakingPool.execute(), tokenPool.execute()]);
    const lockedResponse = await lockedPool.execute();
    return Object.fromEntries(addresses.map((address) => {
        const stakingCount = parseFloat((0, units_1.formatUnits)(stakingResponse[address], options.decimals));
        const tokenCount = parseFloat((0, units_1.formatUnits)(tokenResponse[address], options.decimals));
        let lockedCount = 0;
        for (let i = 0; i < options.lockedAddresses.length; i++) {
            const lockedMap = lockedResponse[`locked_${i}`];
            lockedCount += parseFloat((0, units_1.formatUnits)(lockedMap[address], options.decimals));
        }
        return [address, stakingCount + tokenCount + lockedCount];
    }));
}
exports.strategy = strategy;
