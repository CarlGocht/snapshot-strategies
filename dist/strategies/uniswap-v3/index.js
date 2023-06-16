"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const helper_1 = require("./helper");
const UNISWAP_V3_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
};
exports.author = 'anassohail99';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const tokenReserve = options.tokenReserve === 0 ? 'token0Reserve' : 'token1Reserve';
    const _addresses = addresses.map((address) => address.toLowerCase());
    const params = {
        positions: {
            __args: {
                where: {
                    pool: options.poolAddress.toLowerCase(),
                    owner_in: _addresses
                }
            },
            id: true,
            owner: true,
            liquidity: true,
            tickLower: {
                tickIdx: true
            },
            tickUpper: {
                tickIdx: true
            },
            pool: {
                tick: true,
                sqrtPrice: true,
                liquidity: true,
                feeTier: true
            },
            token0: {
                symbol: true,
                decimals: true,
                id: true
            },
            token1: {
                symbol: true,
                decimals: true,
                id: true
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.positions.__args.block = { number: snapshot };
    }
    const rawData = await (0, utils_1.subgraphRequest)(UNISWAP_V3_SUBGRAPH_URL[network], params);
    const usersUniswap = addresses.map(() => ({
        positions: []
    }));
    rawData?.positions?.map((position) => {
        usersUniswap[_addresses.indexOf(position?.owner)].positions.push(position);
    });
    const reserves = usersUniswap.map((user) => {
        return (0, helper_1.getAllReserves)(user?.positions);
    });
    const score = {};
    reserves?.forEach((user, idx) => {
        let tokenReserveAdd = 0;
        user.forEach((position) => {
            tokenReserveAdd += position[tokenReserve];
        });
        score[addresses[idx]] = tokenReserveAdd;
    });
    return score || {};
}
exports.strategy = strategy;
