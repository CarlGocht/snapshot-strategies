"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const erc721_1 = require("../erc721");
const utils_1 = require("../../utils");
exports.author = 'longfin';
exports.version = '1.1.0';
exports.dependOnOtherAddress = false;
const lpStakingABI = [
    'function stakedTokenBalance(address account) view returns (uint256)'
];
const erc20ABI = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const { ethLPTokenStakingAddress, ethLPTokenAddress, ethWNCGAddress, ethBalancerVaultAddress, ethDccAddress, ncBlockHash, ncGraphQLEndpoint, wncgDecimals = 18, weights: { stakedWNCG: stakedWNCGWeight = 1, dcc: dccWeight = 999, stakedNCG: stakedNCGWeight = 1 } } = options;
    addresses = addresses.map(address_1.getAddress);
    const dccScores = (0, erc721_1.strategy)(space, network, provider, addresses, { address: ethDccAddress }, snapshot).then((scores) => {
        Object.keys(scores).forEach((addr) => {
            scores[addr] *= dccWeight;
        });
        return scores;
    });
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { wNCGInVault, totalLPSupply } = await new utils_1.Multicaller(network, provider, erc20ABI, { blockTag })
        .call('wNCGInVault', ethWNCGAddress, 'balanceOf', [
        ethBalancerVaultAddress
    ])
        .call('totalLPSupply', ethLPTokenAddress, 'totalSupply', [])
        .execute();
    const lpStakingChecker = new utils_1.Multicaller(network, provider, lpStakingABI, {
        blockTag
    });
    addresses.forEach((address) => lpStakingChecker.call(address, ethLPTokenStakingAddress, 'stakedTokenBalance', [address]));
    const stakedWNCGScores = lpStakingChecker
        .execute()
        .then((rawScores) => {
        const scores = {};
        Object.keys(rawScores).forEach((addr) => {
            const amount = rawScores[addr]
                .mul(wNCGInVault)
                .mul(stakedWNCGWeight)
                .div(totalLPSupply);
            scores[addr] = parseFloat((0, units_1.formatUnits)(amount, wncgDecimals));
        });
        return scores;
    });
    const stakedNCGQuery = {
        stateQuery: {
            __args: {
                hash: ncBlockHash
            },
            stakeStates: {
                __args: {
                    addresses: addresses
                },
                deposit: true
            }
        }
    };
    const stakedNCGScores = (0, utils_1.subgraphRequest)(ncGraphQLEndpoint, stakedNCGQuery).then((resp) => {
        const scores = {};
        addresses.forEach((addr, i) => {
            const stakeState = resp.stateQuery.stakeStates[i];
            scores[addr] = parseFloat((0, units_1.formatUnits)((0, units_1.parseUnits)(stakeState?.deposit ?? '0.00', 2).mul(stakedNCGWeight), 2));
        });
        return scores;
    });
    const allScores = await Promise.all([
        dccScores,
        stakedWNCGScores,
        stakedNCGScores
    ]);
    return allScores.reduce((total, scores) => {
        for (const [address, value] of Object.entries(scores)) {
            if (!total[address]) {
                total[address] = 0;
            }
            total[address] += value;
        }
        return total;
    }, {});
}
exports.strategy = strategy;
