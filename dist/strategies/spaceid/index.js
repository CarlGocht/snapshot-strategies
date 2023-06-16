"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const uniswap_v3_1 = require("../uniswap-v3");
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
const constants_1 = require("@ethersproject/constants");
const address_1 = require("@ethersproject/address");
exports.author = 'SID-Marcus';
exports.version = '0.0.1';
const pancakeV3Subgraph = 'https://api.thegraph.com/subgraphs/name/messari/pancakeswap-v3-bsc';
const UNISWAP_ID_USDC_PAIR = '0x6ac6b053a2858bea8ad758db680198c16e523184';
const PANCAKE_ID_USDT_PAIR = '0x4e1f9aDf96dBA6Dc09c973228c286568F1315ea8';
async function getLpTokenOnBsc(addresses, snapshot) {
    const params = {
        accounts: {
            __args: {
                where: {
                    id_in: addresses
                },
                block: snapshot !== 'latest' ? { number: snapshot } : { number_gte: 0 }
            },
            id: true,
            withdraws: {
                __args: {
                    where: { pool: PANCAKE_ID_USDT_PAIR }
                },
                inputTokenAmounts: true,
                timestamp: true
            },
            deposits: {
                __args: {
                    where: { pool: PANCAKE_ID_USDT_PAIR }
                },
                inputTokenAmounts: true,
                timestamp: true
            }
        }
    };
    const pools = await (0, utils_1.subgraphRequest)(pancakeV3Subgraph, params);
    const pancakeIDLPScore = {};
    for (const account of pools.accounts) {
        account.id = (0, address_1.getAddress)(account.id);
        let IdLPToken = bignumber_1.BigNumber.from(0);
        for (const withdraw of account.withdraws) {
            IdLPToken = IdLPToken.add(bignumber_1.BigNumber.from(withdraw.inputTokenAmounts[0]));
        }
        for (const deposit of account.deposits) {
            IdLPToken = IdLPToken.sub(bignumber_1.BigNumber.from(deposit.inputTokenAmounts[0]));
        }
        pancakeIDLPScore[account.id] = IdLPToken.div(constants_1.WeiPerEther).toNumber();
        pancakeIDLPScore[account.id] < 0 && (pancakeIDLPScore[account.id] = 0);
    }
    return pancakeIDLPScore;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    let LPScore = {};
    switch (network) {
        case '1':
            LPScore = await (0, uniswap_v3_1.strategy)(space, network, provider, addresses, {
                poolAddress: UNISWAP_ID_USDC_PAIR,
                tokenReserve: 0
            }, snapshot);
            break;
        case '56':
            LPScore = await getLpTokenOnBsc(addresses, snapshot);
            break;
    }
    return Object.fromEntries(addresses.map((address) => {
        const addressScore = LPScore[address] ?? 0;
        // console.log(address, LPScore[address], delegationPower[address]);
        return [(0, address_1.getAddress)(address), addressScore];
    }));
}
exports.strategy = strategy;
