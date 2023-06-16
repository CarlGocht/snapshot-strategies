"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'benlyaunzon';
exports.version = '0.1.0';
const ZRX_STAKING_POOLS = {
    '1': 'https://api.0x.org/staking/pools',
    '42': 'https://staging.api.0x.org/staking/pools'
};
const abi = [
    'function getVotingPower(address account, bytes32[] operatedPoolIds) view returns (uint256 votingPower)'
];
const encodePoolId = (poolId) => `0x${poolId.toString(16).padStart(64, '0')}`;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Early return 0 voting power if governanceContract not correctly set
    if (!options.governerContract) {
        return Object.fromEntries(addresses.map((address) => [address, '0']));
    }
    const erc20Balances = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const zrxStakingPoolsRes = await (0, cross_fetch_1.default)(ZRX_STAKING_POOLS[network]);
    const { stakingPools } = await zrxStakingPoolsRes.json();
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => {
        const addressOperatedPools = stakingPools.filter((p) => p.operatorAddress.toLowerCase() === address.toLowerCase());
        const pools = addressOperatedPools
            ? addressOperatedPools.map((pool) => encodePoolId(parseInt(pool.poolId, 10)))
            : [];
        return [
            options.governerContract,
            'getVotingPower',
            [address.toLowerCase(), pools]
        ];
    }), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals)) +
            erc20Balances[addresses[i]]
    ]));
}
exports.strategy = strategy;
