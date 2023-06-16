"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const utils_2 = require("./utils");
exports.author = 'maxaleks';
exports.version = '0.1.0';
const EASY_STAKING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/maxaleks/easy-staking';
const ercABI = [
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function getEasyStakingDeposits(addresses, snapshot) {
    const params = {
        deposits: {
            __args: {
                where: {
                    user_in: addresses.map((address) => address.toLowerCase()),
                    amount_gt: 0
                },
                first: 1000,
                skip: 0
            },
            user: true,
            amount: true,
            timestamp: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.deposits.__args.block = { number: snapshot };
    }
    let page = 0;
    let deposits = [];
    while (true) {
        params.deposits.__args.skip = page * 1000;
        const data = await (0, utils_1.subgraphRequest)(EASY_STAKING_SUBGRAPH_URL, params);
        deposits = deposits.concat(data.deposits);
        page++;
        if (data.deposits.length < 1000)
            break;
    }
    return deposits.map((deposit) => ({
        ...deposit,
        amount: bignumber_1.BigNumber.from(deposit.amount),
        timestamp: bignumber_1.BigNumber.from(deposit.timestamp)
    }));
}
async function getEasyStakingParams(snapshot) {
    const params = {
        commonData: {
            __args: {
                id: 'common'
            },
            sigmoidParamA: true,
            sigmoidParamB: true,
            sigmoidParamC: true,
            totalSupplyFactor: true,
            totalStaked: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.commonData.__args.block = { number: snapshot };
    }
    const { commonData } = await (0, utils_1.subgraphRequest)(EASY_STAKING_SUBGRAPH_URL, params);
    return {
        sigmoidParameters: {
            a: bignumber_1.BigNumber.from(commonData.sigmoidParamA),
            b: bignumber_1.BigNumber.from(commonData.sigmoidParamB),
            c: bignumber_1.BigNumber.from(commonData.sigmoidParamC)
        },
        totalSupplyFactor: bignumber_1.BigNumber.from(commonData.totalSupplyFactor),
        totalStaked: bignumber_1.BigNumber.from(commonData.totalStaked)
    };
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const [easyStakingDeposits, { sigmoidParameters, totalSupplyFactor, totalStaked }, block, totalSupply] = await Promise.all([
        getEasyStakingDeposits(addresses, snapshot),
        getEasyStakingParams(snapshot),
        provider.getBlock(snapshot),
        (0, utils_1.call)(provider, ercABI, [options.address, 'totalSupply', []])
    ]);
    const result = {};
    addresses.forEach((address) => {
        result[address] = 0;
    });
    if (!easyStakingDeposits || easyStakingDeposits.length === 0) {
        return result;
    }
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => {
        let totalBalance = balance;
        const userDeposits = easyStakingDeposits.filter((deposit) => deposit.user.toLowerCase() === address.toLowerCase());
        userDeposits.forEach((deposit) => {
            const timePassed = bignumber_1.BigNumber.from(block.timestamp).sub(deposit.timestamp);
            const emission = (0, utils_2.calculateEmission)(deposit.amount, timePassed, sigmoidParameters, totalSupplyFactor, totalSupply, totalStaked);
            totalBalance += parseFloat((0, units_1.formatUnits)(deposit.amount.add(emission).toString(), options.decimals));
        });
        return [address, totalBalance];
    }));
}
exports.strategy = strategy;
