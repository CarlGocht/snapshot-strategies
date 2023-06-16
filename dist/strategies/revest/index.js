"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.SUBGRAPH_URL = exports.version = exports.author = void 0;
const abi_1 = require("@ethersproject/abi");
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
exports.author = 'RobAnon';
exports.version = '0.1.0';
exports.SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/alexvorobiov/eip1155subgraph'
};
const abi2 = [
    'function getDisplayValues(uint fnftId, uint) external view returns (bytes memory)',
    'function rewardsHandlerAddress() external view returns (address)',
    'function getAsset(uint fnftId) external view returns (address)'
];
const abi = [
    'function getFNFT(uint fnftId) external view returns (tuple(address asset, address pipeToContract, uint depositAmount, uint depositMul, uint split, uint depositStopTime, bool maturityExtension, bool isMulti, bool nontransferrable))'
];
const abi3 = [
    'function totalLPAllocPoint() external view returns (uint)',
    'function totalBasicAllocPoint() external view returns (uint)'
];
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const PRECISION = bignumber_1.BigNumber.from('1000000000000000000000');
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const eip1155OwnersParams = {
        accounts: {
            __args: {
                where: {
                    id_in: addresses.map((a) => a.toLowerCase())
                }
            },
            id: true,
            balances: {
                value: true,
                token: {
                    registry: {
                        id: true
                    },
                    identifier: true
                }
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        eip1155OwnersParams.accounts.__args.block = { number: snapshot };
    }
    const idsToCheck = new Set();
    const result = await (0, utils_2.subgraphRequest)(exports.SUBGRAPH_URL[network], eip1155OwnersParams);
    result.accounts.forEach((element) => {
        element.relBal = element.balances.filter((balance) => {
            const isRightAddress = balance.token.registry.id.toLowerCase() ===
                options.address.toLowerCase() && balance.value != '0';
            if (isRightAddress) {
                idsToCheck.add(balance.token.identifier);
            }
            return isRightAddress;
        });
    });
    let ids = Array.from(idsToCheck);
    const response = await (0, utils_1.multicall)(network, _provider, abi2, ids.map((id) => [options.staking, 'getDisplayValues', [id, 0]]), { blockTag });
    const fnfts = Object.fromEntries(response.map((value, i) => [
        ids[i],
        abi_1.defaultAbiCoder.decode(['uint', 'uint'], value[0])[0]
    ]));
    Object.keys(fnfts).forEach((element) => {
        if (fnfts[element].eq('0')) {
            delete fnfts[element];
        }
    });
    ids = Object.keys(fnfts);
    const response2 = await (0, utils_1.multicall)(network, _provider, abi, ids.map((id) => [options.tokenVault, 'getFNFT', [id]]), { blockTag });
    const completeFNFTs = Object.fromEntries(response2.map((value, i) => [
        ids[i],
        {
            allocPoints: fnfts[ids[i]],
            isRVST: value[0].asset.toLowerCase() == options.token.toLowerCase()
        }
    ]));
    let rewards = await (0, utils_1.multicall)(network, _provider, abi2, [''].map(() => [options.staking, 'rewardsHandlerAddress', []]), { blockTag });
    rewards = rewards[0][0];
    let allocLP = await (0, utils_1.multicall)(network, _provider, abi3, [
        [rewards, 'totalLPAllocPoint', []],
        [rewards, 'totalBasicAllocPoint', []]
    ], { blockTag });
    const allocToken = allocLP[1][0];
    allocLP = allocLP[0][0];
    //allocToken = allocToken[0][0];
    const finalResult = {};
    result.accounts.forEach((account) => {
        account.relBal.forEach((relBalEle) => {
            if (completeFNFTs.hasOwnProperty(relBalEle.token.identifier)) {
                const score = completeFNFTs[relBalEle.token.identifier].allocPoints
                    .mul(PRECISION)
                    .div(completeFNFTs[relBalEle.token.identifier].isRVST
                    ? allocToken
                    : allocLP);
                if (finalResult.hasOwnProperty((0, address_1.getAddress)(account.id))) {
                    finalResult[(0, address_1.getAddress)(account.id)].add(score);
                }
                else {
                    finalResult[(0, address_1.getAddress)(account.id)] = score;
                }
            }
        });
    });
    const returnVals = {};
    Object.keys(finalResult).forEach((element) => {
        returnVals[element] = parseInt(finalResult[element].toString(), 10);
    });
    return returnVals;
}
exports.strategy = strategy;
