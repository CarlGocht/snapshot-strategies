"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
exports.author = 'pkretzschmar';
exports.version = '0.1.0';
const GIVETH_SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/giveth/giveth-economy-mainnet';
const BALANCER_SUBGRAPH_API = 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2';
const poolParams = {
    pool: {
        __args: {
            id: '0x7819f1532c49388106f7762328c51ee70edd134c000200000000000000000109'
        },
        tokens: {
            balance: true,
            symbol: true
        },
        totalShares: true
    }
};
const params = {
    balances: {
        __args: {
            orderBy: 'id',
            orderDirection: 'asc',
            where: {
                id_in: []
            }
        },
        id: true,
        balance: true,
        givStaked: true,
        balancerLp: true,
        balancerLpStaked: true
    }
};
const formatReserveBalance = (data, decimals) => {
    const givToken = data.pool.tokens.find((elem) => elem.symbol === 'GIV');
    const balance = (0, units_1.parseUnits)(givToken.balance, decimals);
    const totalShares = (0, units_1.parseUnits)(data.pool.totalShares, decimals);
    return { balance, totalShares };
};
const calcGivAmount = (amountLP, totalLP, givBalance) => {
    return amountLP.mul(givBalance).div(totalLP);
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    if (snapshot !== 'latest') {
        // @ts-ignore
        poolParams.pool.__args.block = { number: snapshot };
        // @ts-ignore
        params.balances.__args.block = { number: snapshot };
    }
    const balData = await (0, utils_1.subgraphRequest)(BALANCER_SUBGRAPH_API, poolParams);
    const balFormatedData = formatReserveBalance(balData, options.decimals);
    params.balances.__args.where.id_in = addresses.map((address) => address.toLowerCase());
    const data = await (0, utils_1.subgraphRequest)(GIVETH_SUBGRAPH_API, params);
    const dataBalances = data.balances;
    const score = {};
    dataBalances.map((addressBalance) => {
        const { id, balance, givStaked, balancerLp, balancerLpStaked } = addressBalance;
        const totalGIV = bignumber_1.BigNumber.from(balance).add(givStaked);
        const balGIV = calcGivAmount(bignumber_1.BigNumber.from(balancerLp).add(balancerLpStaked), balFormatedData.totalShares, balFormatedData.balance);
        score[(0, address_1.getAddress)(id)] = parseFloat((0, units_1.formatUnits)(totalGIV.add(balGIV), options.decimals));
    });
    return score;
}
exports.strategy = strategy;
