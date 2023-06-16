"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwaprLiquidityProvidersBalance = void 0;
const decimal_js_light_1 = require("decimal.js-light");
const address_1 = require("@ethersproject/address");
const commons_1 = require("./commons");
const utils_1 = require("../../utils");
const mergeStandardAndStakedPositions = (standardPositions, stakedPositions) => {
    return stakedPositions.reduce((accumulator, stakedPosition) => {
        const index = accumulator.findIndex((p) => p.user.id.toLowerCase() === stakedPosition.user.id.toLowerCase());
        if (index >= 0)
            accumulator[index].liquidityTokenBalance = new decimal_js_light_1.Decimal(accumulator[index].liquidityTokenBalance)
                .plus(stakedPosition.stakedAmount)
                .toString();
        else
            accumulator.push({
                ...stakedPosition,
                pair: stakedPosition.targetedPair,
                liquidityTokenBalance: stakedPosition.stakedAmount
            });
        return accumulator;
    }, standardPositions);
};
const getPositions = async (network, addresses, options, snapshot) => {
    const wantedTokenAddress = options.address;
    const swaprSubgraphUrl = commons_1.SWAPR_SUBGRAPH_URL[network];
    const [token0Query, token1Query] = ['token0', 'token1'].map((key) => ({
        pairs: {
            __args: {
                where: {
                    [key]: wantedTokenAddress.toLowerCase()
                },
                first: 1000
            },
            id: true
        }
    }));
    if (snapshot !== 'latest') {
        // @ts-ignore
        token0Query.pairs.__args.block = { number: snapshot };
        // @ts-ignore
        token1Query.pairs.__args.block = { number: snapshot };
    }
    const swprPairsByToken0 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, token0Query);
    const swprPairsByToken1 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, token1Query);
    const [liquidityPositionsByToken0Query, liquidityPositionsByToken1Query] = [
        swprPairsByToken0,
        swprPairsByToken1
    ].map((wrappedPairs) => ({
        liquidityPositions: {
            __args: {
                where: {
                    user_in: addresses.map((address) => address.toLowerCase()),
                    pair_in: wrappedPairs.pairs.map((pair) => pair.id),
                    liquidityTokenBalance_gt: 0
                },
                first: 1000
            },
            user: {
                id: true
            },
            liquidityTokenBalance: true,
            pair: {
                totalSupply: true,
                reserve0: true,
                reserve1: true
            }
        }
    }));
    const liquidityPositionsByToken0 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, liquidityPositionsByToken0Query);
    const liquidityPositionsByToken1 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, liquidityPositionsByToken1Query);
    const [liquidityMiningPositionsByToken0Query, liquidityMiningPositionsByToken1Query] = [swprPairsByToken0, swprPairsByToken1].map((wrappedPairs) => ({
        liquidityMiningPositions: {
            __args: {
                where: {
                    user_in: addresses.map((address) => address.toLowerCase()),
                    targetedPair_in: wrappedPairs.pairs.map((pair) => pair.id),
                    stakedAmount_gt: 0
                },
                first: 1000
            },
            user: {
                id: true
            },
            stakedAmount: true,
            targetedPair: {
                totalSupply: true,
                reserve0: true,
                reserve1: true
            }
        }
    }));
    const liquidityMiningPositionsByToken0 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, liquidityMiningPositionsByToken0Query);
    const liquidityMiningPositionsByToken1 = await (0, utils_1.subgraphRequest)(swaprSubgraphUrl, liquidityMiningPositionsByToken1Query);
    return {
        positionsByToken0: mergeStandardAndStakedPositions(liquidityPositionsByToken0.liquidityPositions, liquidityMiningPositionsByToken0.liquidityMiningPositions),
        positionsByToken1: mergeStandardAndStakedPositions(liquidityPositionsByToken1.liquidityPositions, liquidityMiningPositionsByToken1.liquidityMiningPositions)
    };
};
const lpDataToBalanceMap = (positions, useToken0Data) => {
    return positions.reduce((accumulator, position) => {
        const userLpTokenBalance = new decimal_js_light_1.Decimal(position.liquidityTokenBalance);
        const pairTotalSupply = new decimal_js_light_1.Decimal(position.pair.totalSupply);
        const userPoolPercentage = userLpTokenBalance.dividedBy(pairTotalSupply);
        const userHolding = new decimal_js_light_1.Decimal(useToken0Data ? position.pair.reserve0 : position.pair.reserve1).mul(userPoolPercentage);
        const userAddress = (0, address_1.getAddress)(position.user.id);
        accumulator[userAddress] =
            (accumulator[userAddress] || 0) + userHolding.toNumber();
        return accumulator;
    }, {});
};
const getSwaprLiquidityProvidersBalance = async (network, addresses, options, snapshot) => {
    const { positionsByToken0, positionsByToken1 } = await getPositions(network, addresses, options, snapshot);
    const balanceMap = {};
    (0, commons_1.mergeBalanceMaps)(balanceMap, lpDataToBalanceMap(positionsByToken0, true));
    (0, commons_1.mergeBalanceMaps)(balanceMap, lpDataToBalanceMap(positionsByToken1, false));
    return balanceMap;
};
exports.getSwaprLiquidityProvidersBalance = getSwaprLiquidityProvidersBalance;
