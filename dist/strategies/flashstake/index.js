"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const FLASHSTAKE_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/blockzerohello/flash-stake-stats-v2-subgraph'
};
exports.author = 'anassohail99';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        users: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000
            },
            id: true,
            liquidityPositions: {
                liquidityTokenBalance: true,
                user: {
                    id: true
                },
                pair: {
                    id: true,
                    token0: {
                        id: true
                    },
                    reserve0: true,
                    token1: {
                        id: true
                    },
                    reserve1: true,
                    totalSupply: true
                }
            }
        }
    };
    const params2 = {
        stakes: {
            __args: {
                where: {
                    user_in: addresses.map((address) => address.toLowerCase()),
                    isActive: true
                }
            },
            id: true,
            amountIn: true,
            user: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args.block = { number: snapshot };
        // @ts-ignore
        params2.stakes.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(FLASHSTAKE_SUBGRAPH_URL[network], params);
    const stakesResult = await (0, utils_1.subgraphRequest)(FLASHSTAKE_SUBGRAPH_URL[network], params2);
    const score = {};
    if (stakesResult && stakesResult.stakes) {
        stakesResult.stakes.map((_data) => {
            const address = (0, address_1.getAddress)(_data.user);
            if (!score[address])
                score[address] = 0;
            score[address] = Number(score[address]) + Number(_data.amountIn);
        });
    }
    if (result && result.users) {
        result.users.map((_data) => {
            if (_data.liquidityPositions[0]?.pair) {
                _data.liquidityPositions.map((__data) => {
                    const address = (0, address_1.getAddress)(__data.user.id);
                    const token0perFlash = Number(__data.pair.reserve0) / Number(__data.pair.totalSupply);
                    const userScore = token0perFlash * Number(__data.liquidityTokenBalance);
                    if (!score[address])
                        score[address] = 0;
                    score[address] = Number(score[address]) + userScore;
                });
            }
        });
    }
    return score || {};
}
exports.strategy = strategy;
