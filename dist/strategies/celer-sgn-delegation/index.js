"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'dominator008';
exports.version = '0.2.0';
const v1StakingABI = [
    'function getValidatorNum() view returns (uint256)',
    'function validatorSet(uint256) view returns (address)',
    'function getDelegatorInfo(address _candidateAddr, address _delegatorAddr) view returns (uint256 delegatedStake, uint256 undelegatingStake, uint256[] intentAmounts, uint256[] intentProposedTimes)'
];
const v2StakingABI = [
    'function getDelegatorTokens(address _delAddr) view returns (uint256, uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Staking V1
    // 1.1. Get the number of validators
    const validatorNum = (await (0, utils_1.multicall)(network, provider, v1StakingABI, [[options.v1StakingAddress, 'getValidatorNum', []]], { blockTag }))[0][0];
    // 1.2. Get the addresses of the validators
    const validatorAddresses = (await (0, utils_1.multicall)(network, provider, v1StakingABI, Array.from(Array(validatorNum.toNumber()).keys()).map((index) => [
        options.v1StakingAddress,
        'validatorSet',
        [index]
    ]), { blockTag })).map((value) => value[0]);
    // 1.3. Get the delegation of all addresses to all validators
    const callInfos = validatorAddresses.reduce((infos, validatorAddress) => infos.concat(addresses.map((address) => [
        address,
        [
            options.v1StakingAddress,
            'getDelegatorInfo',
            [validatorAddress, address]
        ]
    ])), []);
    const callInfosCopy = [...callInfos];
    const batchSize = 2000;
    const batches = new Array(Math.ceil(callInfos.length / batchSize))
        .fill(0)
        .map(() => callInfosCopy.splice(0, batchSize));
    let delegatorInfoResponse = [];
    for (let i = 0; i < batches.length; i++) {
        delegatorInfoResponse = delegatorInfoResponse.concat(await (0, utils_1.multicall)(network, provider, v1StakingABI, batches[i].map((info) => info[1]), { blockTag }));
    }
    // 1.4. For each address, aggregate the delegations to each validator
    const delegations = delegatorInfoResponse.map((info, i) => [
        callInfos[i][0],
        info.delegatedStake
    ]);
    const aggregatedDelegations = delegations.reduce((aggregates, delegation) => {
        const delegatorAddress = delegation[0];
        if (aggregates[delegatorAddress]) {
            aggregates[delegatorAddress] = aggregates[delegatorAddress].add(delegation[1]);
        }
        else {
            aggregates[delegatorAddress] = delegation[1];
        }
        return aggregates;
    }, {});
    // Staking V2
    // 2.1. Get delegator tokens for all addresses
    const v2DelegatorTokens = (await (0, utils_1.multicall)(network, provider, v2StakingABI, addresses.map((address) => [
        options.v2StakingViewerAddress,
        'getDelegatorTokens',
        [address]
    ]), { blockTag })).map((value) => value[0]);
    const v2DelegatorTokensMap = addresses.reduce((map, address, i) => {
        map[address] = v2DelegatorTokens[i];
        return map;
    }, {});
    // 3. Sum up V1 and V2 delegations
    return Object.entries(aggregatedDelegations).reduce((transformed, [delegatorAddress, delegatedStake]) => {
        transformed[delegatorAddress] = parseFloat((0, units_1.formatUnits)(delegatedStake.toString(), 18));
        if (v2DelegatorTokensMap[delegatorAddress]) {
            transformed[delegatorAddress] += parseFloat((0, units_1.formatUnits)(v2DelegatorTokensMap[delegatorAddress].toString(), 18));
        }
        return transformed;
    }, {});
}
exports.strategy = strategy;
