"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const networks_json_1 = __importDefault(require("@snapshot-labs/snapshot.js/src/networks.json"));
exports.author = 'eabz';
exports.version = '0.1.0';
const abi = [
    'function getEthBalance(address addr) public view returns (uint256 balance)'
];
const validator_abi = [
    'function idByStakingAddress(address addr) external view returns(uint256)'
];
const stake_getpools_abi = [
    'function getDelegatorPools(address _delegator,uint256 _offset,uint256 _length) external view returns(uint256[] memory result)'
];
const stake_amount_abi = [
    'function stakeAmount(uint256,address) external view returns(uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi_pool = new utils_1.Multicaller(network, provider, validator_abi, {
        blockTag
    });
    addresses.forEach((address) => multi_pool.call(address, options.validators, 'idByStakingAddress', [
        address
    ]));
    const multi_delegated = new utils_1.Multicaller(network, provider, stake_getpools_abi, {
        blockTag
    });
    addresses.forEach((address) => multi_delegated.call(address, options.staking, 'getDelegatorPools', [
        address,
        0,
        0
    ]));
    const result_pools = await multi_pool.execute();
    const result_delegated_pools = await multi_delegated.execute();
    const multi_own_staked = new utils_1.Multicaller(network, provider, stake_amount_abi, {
        blockTag
    });
    const multi_staked = new utils_1.Multicaller(network, provider, stake_amount_abi, {
        blockTag
    });
    for (let i = 0; i < addresses.length; i++) {
        const pool = result_pools[addresses[i]];
        if (pool.toString() !== '0') {
            multi_own_staked.call(addresses[i], options.staking, 'stakeAmount', [
                pool,
                '0x0000000000000000000000000000000000000000'
            ]);
        }
        const pools = result_delegated_pools[addresses[i]];
        for (const pool of pools) {
            multi_staked.call(addresses[i] + '-' + pool.toString(), options.staking, 'stakeAmount', [pool, addresses[i]]);
        }
    }
    const final_balances = {};
    const result_pools_own = await multi_own_staked.execute();
    const result_pools_staked = await multi_staked.execute();
    Object.keys(result_pools_own).map((addr) => {
        final_balances[addr] = parseFloat((0, units_1.formatUnits)(result_pools_own[addr].toString()));
    });
    Object.keys(result_pools_staked).map((addr) => {
        const address = addr.split('-');
        const addition = parseFloat((0, units_1.formatUnits)(result_pools_staked[addr].toString()));
        if (final_balances[address[0]]) {
            final_balances[address[0]] += addition;
        }
        else {
            final_balances[address[0]] = addition;
        }
    });
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        networks_json_1.default[network].multicall,
        'getEthBalance',
        [address]
    ]), { blockTag });
    const balances = Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), 18))
    ]));
    Object.keys(balances).map((account) => {
        if (final_balances[account]) {
            balances[account] += final_balances[account];
        }
    });
    return balances;
}
exports.strategy = strategy;
