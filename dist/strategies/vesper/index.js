"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
exports.author = 'marcelomorgado';
exports.version = '1.0.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const snapshotBlock = typeof snapshot === 'number' ? snapshot : await (0, utils_1.getBlockNumber)(provider);
    const snapshotBlocks = [];
    const { blocksPerPeriod, minBlock } = options;
    const periods = 4;
    for (let i = 0; i < periods; i++) {
        const blockTag = snapshotBlock - blocksPerPeriod * i;
        if (blockTag < minBlock) {
            break;
        }
        snapshotBlocks.push(blockTag);
    }
    const scores = await Promise.all([
        ...snapshotBlocks.map((blockTag) => getScores(provider, addresses, options, blockTag))
    ]);
    const averageScore = {};
    addresses.forEach((address) => {
        const userScore = scores
            .map((score) => score[address])
            .reduce((accumulator, score) => (accumulator += score), 0);
        averageScore[address] = userScore / snapshotBlocks.length;
    });
    return Object.fromEntries(Array(addresses.length)
        .fill('')
        .map((_, i) => {
        const score = averageScore[addresses[i]];
        return [addresses[i], score];
    }));
}
exports.strategy = strategy;
async function getScores(provider, addresses, options, blockTag) {
    const { votingPower: votingPowerAddress } = options;
    const erc20Abi = ['function balanceOf(address) view returns (uint256)'];
    const multi = new utils_2.Multicaller('1', provider, erc20Abi, { blockTag });
    addresses.forEach((address) => {
        multi.call(`token.${address}`, votingPowerAddress, 'balanceOf', [address]);
    });
    const result = await multi.execute();
    const score = {};
    addresses.forEach((address) => {
        const balance = result.token[address];
        score[address] = parseFloat((0, units_1.formatUnits)(balance, 18));
    });
    return score;
}
