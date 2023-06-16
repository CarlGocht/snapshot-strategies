"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const helper_1 = require("./helper");
const UNISWAP_V3_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
};
exports.author = 'ribbon-finance';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const tokenReserve = options.tokenReserve === 0 ? 'token0Reserve' : 'token1Reserve';
    const _addresses = addresses.map((address) => address.toLowerCase());
    // The subgraph query does not paginate past the first 1000 items
    const params = {
        positions: {
            __args: {
                first: 1000,
                where: {
                    pool: options.poolAddress.toLowerCase(),
                    owner: helper_1.UNISWAP_V3_STAKER.toLowerCase()
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
    const positions = rawData.positions;
    const tokenIDs = positions.map((pos) => parseInt(pos.id));
    const stakeInfo = await (0, helper_1.getStakeInfo)(snapshot, network, _provider, options, tokenIDs);
    const reserves = (0, helper_1.getAllReserves)(positions);
    const score = {};
    reserves?.forEach((position, idx) => {
        const { owner, reward } = stakeInfo[positions[idx].id];
        const unclaimedReward = parseFloat((0, units_1.formatUnits)(reward, 18));
        if (_addresses.includes(owner)) {
            const checksumOwner = (0, address_1.getAddress)(owner);
            if (!score[checksumOwner]) {
                score[checksumOwner] = position[tokenReserve] + unclaimedReward;
            }
            else {
                score[checksumOwner] += position[tokenReserve] + unclaimedReward;
            }
        }
    });
    return score || {};
}
exports.strategy = strategy;
