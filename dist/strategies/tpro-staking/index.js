"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'tokenomia-pro';
exports.version = '1.0.0';
const abi = [
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 pendingRewards, uint256 lockedTimestamp, uint256 lockupTimestamp, uint256 lockupTimerange, uint256 virtAmount)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const promises = [];
    options.smartContracts.forEach((contract) => {
        promises.push((0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [contract, 'userInfo', [0, address]]), { blockTag }));
    });
    const resolvedPromises = await Promise.all(promises);
    const votingPowers = [];
    resolvedPromises.forEach((response, contractIdx) => {
        const contractFactor = options.contractFactor[contractIdx];
        const currentTimestamp = Math.floor(Date.now() / 1000);
        for (let i = 0; i < response.length; i++) {
            const user = addresses[i];
            const endTimestamp = Number(response[i].lockedTimestamp);
            const tokensAmount = Number((0, units_1.formatEther)(response[i].amount));
            const remainMonths = Number(endTimestamp - currentTimestamp) / (60 * 60 * 24 * 30);
            if (tokensAmount <= 0 || remainMonths <= 0) {
                continue;
            }
            const votePower = Math.floor(tokensAmount *
                Math.pow(remainMonths, options.powerFactor) *
                contractFactor);
            if (votePower && votingPowers[user]) {
                votingPowers[user] += votePower;
            }
            else if (votePower) {
                votingPowers[user] = votePower;
            }
        }
    });
    return votingPowers || [];
}
exports.strategy = strategy;
