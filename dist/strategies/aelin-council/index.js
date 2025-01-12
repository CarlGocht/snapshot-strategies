"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const contracts_1 = require("@ethersproject/contracts");
const providers_1 = require("@ethersproject/providers");
const utils_1 = require("../../utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = '0xcdb';
exports.version = '1.0.0';
const GRAPH_API_URL = {
    uniswap: {
        mainnet: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    },
    aelin: {
        mainnet: 'https://api.thegraph.com/subgraphs/name/0xcdb/aelin-governance',
        optimism: 'https://api.thegraph.com/subgraphs/name/0xcdb/aelin-governance-optimism'
    }
};
const GELATO_POOL_ADDRESS = '0x665d8D87ac09Bdbc1222B8B9E72Ddcb82f76B54A';
const gelatoPoolAbi = [
    'function getUnderlyingBalances() external view returns (uint256 amount0Current, uint256 amount1Current)',
    'function totalSupply() external view returns (uint256)'
];
function returnGraphParams(snapshot, addresses) {
    return {
        aelinStakers: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000,
                block: {
                    number: snapshot
                }
            },
            id: true,
            balancePool1: true,
            balancePool2: true
        }
    };
}
const getTokenRates = async () => {
    const results = await (0, cross_fetch_1.default)('https://api.coingecko.com/api/v3/simple/price?ids=aelin%2Cethereum&vs_currencies=usd');
    const rates = await results.json();
    const { aelin: { usd: aelinRate }, ethereum: { usd: ethRate } } = rates;
    return { aelinRate, ethRate };
};
const getGUniRate = async (contract, aelinRate, ethRate, snapshot) => {
    const [balances, gUNITotalSupply] = await Promise.all([
        contract.getUnderlyingBalances({ blockTag: snapshot }),
        contract.totalSupply({ blockTag: snapshot })
    ]);
    const { amount0Current, amount1Current } = balances;
    const totalValueInPool = (amount0Current / 1e18) * ethRate + (amount1Current / 1e18) * aelinRate;
    return totalValueInPool / (gUNITotalSupply / 1e18);
};
const getUniV2Rate = async (aelinRate, ethRate, snapshot) => {
    const results = await (0, utils_1.subgraphRequest)(GRAPH_API_URL.uniswap.mainnet, {
        pairs: {
            __args: {
                where: {
                    id: '0x974d51fafc9013e42cbbb9465ea03fe097824bcc'
                },
                first: 1000,
                block: {
                    number: snapshot
                }
            },
            token0Price: true,
            token1Price: true,
            reserve0: true,
            reserve1: true,
            totalSupply: true
        }
    });
    const { reserve0: amount0, reserve1: amount1, totalSupply } = results.pairs[0];
    const totalValueInPool = Number(amount0) * aelinRate + Number(amount1) * ethRate;
    return totalValueInPool / Number(totalSupply);
};
async function strategy(_space, _network, _provider, _addresses, _options) {
    const L1_SNAPSHOT = _options.blockL1;
    const L2_SNAPSHOT = _options.blockL2;
    const score = {};
    const squaredScore = {};
    const [l1Stakers, l2Stakers] = await Promise.all([
        (0, utils_1.subgraphRequest)(GRAPH_API_URL.aelin.mainnet, returnGraphParams(L1_SNAPSHOT, _addresses)),
        (0, utils_1.subgraphRequest)(GRAPH_API_URL.aelin.optimism, returnGraphParams(L2_SNAPSHOT, _addresses))
    ]);
    // We start by mapping all the Pool 1 balances
    (l1Stakers?.aelinStakers ?? []).forEach(({ balancePool1, id }) => {
        score[(0, address_1.getAddress)(id)] = balancePool1 / 1e18;
    });
    (l2Stakers?.aelinStakers ?? []).forEach(({ balancePool1, id }) => {
        const key = (0, address_1.getAddress)(id);
        const balance = balancePool1 / 1e18;
        if (!!score[key]) {
            score[key] += balance;
        }
        else {
            score[key] = balance;
        }
    });
    // For Pool 2, we need to calculate the price of each staked token (g-uni for OP and uni-v2 for Mainnet)
    const optimismProvider = new providers_1.JsonRpcProvider('https://mainnet.optimism.io', 'optimism');
    const gelatoPoolContract = new contracts_1.Contract(GELATO_POOL_ADDRESS, gelatoPoolAbi, optimismProvider);
    const { aelinRate, ethRate } = await getTokenRates();
    const gUNIRate = await getGUniRate(gelatoPoolContract, aelinRate, ethRate, L2_SNAPSHOT);
    const uniV2Rate = await getUniV2Rate(aelinRate, ethRate, L1_SNAPSHOT);
    (l2Stakers?.aelinStakers ?? []).forEach(async ({ balancePool2, id }) => {
        const gUNIValue = gUNIRate * (balancePool2 / 1e18);
        // We divide by 2 because it's a 50-50 pool. Only half the value is in Aelin.
        const aelinAmount = gUNIValue / (2 * aelinRate);
        const key = (0, address_1.getAddress)(id);
        if (!!score[key]) {
            score[key] += aelinAmount;
        }
        else {
            score[key] = aelinAmount;
        }
    });
    (l1Stakers?.aelinStakers ?? []).forEach(async ({ balancePool2, id }) => {
        const uniV2Value = uniV2Rate * (balancePool2 / 1e18);
        // We divide by 2 because it's a 50-50 pool. Only half the value is in Aelin.
        const aelinAmount = uniV2Value / (2 * aelinRate);
        const key = (0, address_1.getAddress)(id);
        if (!!score[key]) {
            score[key] += aelinAmount;
        }
        else {
            score[key] = aelinAmount;
        }
    });
    Object.keys(score).forEach((address) => (squaredScore[address] = Math.sqrt(score[address])));
    return squaredScore;
}
exports.strategy = strategy;
