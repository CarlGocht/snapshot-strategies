"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
const masterchef_pool_balance_1 = require("../masterchef-pool-balance");
const units_1 = require("@ethersproject/units");
const constants_1 = require("@ethersproject/constants");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
const PAGE_SIZE = 1000;
exports.author = 'pancake-swap';
exports.version = '0.0.1';
const CAKE_ADDRESS = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
const CAKE_VAULT_ADDRESS = '0xa80240Eb5d7E05d3F250cF000eEc0891d00b51CC';
const IFO_POOL_START_BLOCK = 13463954;
const IFO_POOL_ADDRESS = '0x1B2A2f6ed4A1401E8C73B4c2B6172455ce2f78E8';
const CAKE_BNB_LP_ADDRESS = '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0';
const MASTER_CHEF_ADDRESS = {
    v1: '0x73feaa1eE314F8c655E354234017bE2193C9E24E'
};
const onChainVotingPower = {
    v0: {
        blockNumber: 16300686,
        address: '0xc0FeBE244cE1ea66d27D23012B3D616432433F42'
    },
    v1: {
        blockNumber: 17137653,
        address: '0x67Dfbb197602FDB9A9D305cC7A43b95fB63a0A56'
    }
};
const veCakeBlockNumber = 34371669;
const abi = [
    'function getVotingPowerWithoutPool(address _user) view returns (uint256)'
];
const vaultAbi = [
    'function getPricePerFullShare() view returns (uint256)',
    'function userInfo(address) view returns (uint256 shares, uint256 lastDepositedTime, uint256 cakeAtLastUserAction, uint256 lastUserActionTime)'
];
const smartChefUrl = 'https://api.thegraph.com/subgraphs/name/pancakeswap/smartchef';
async function getPools(provider, snapshot) {
    let blockNumber = snapshot;
    if (blockNumber === 'latest') {
        blockNumber = await provider.getBlockNumber();
    }
    const params = {
        smartChefs: {
            __args: {
                where: {
                    stakeToken: CAKE_ADDRESS.toLowerCase(),
                    endBlock_gte: blockNumber,
                    startBlock_lt: blockNumber
                }
            },
            id: true
        }
    };
    const pools = await (0, utils_1.subgraphRequest)(smartChefUrl, params);
    return pools.smartChefs;
}
async function getSmartChefStakedCakeAmount(snapshot, poolAddresses, addresses) {
    const addressChunks = chunk(addresses, 1500);
    let results = [];
    for (const addressChunk of addressChunks) {
        const params = {
            users: {
                __args: {
                    where: {
                        pool_in: poolAddresses.map((addr) => addr.toLowerCase()),
                        address_in: addressChunk.map((addr) => addr.toLowerCase()),
                        stakeAmount_gt: '0'
                    },
                    first: PAGE_SIZE
                },
                address: true,
                stakeAmount: true
            }
        };
        let page = 0;
        let triedBlockNumber = false;
        while (true) {
            // @ts-ignore
            params.users.__args.skip = page * PAGE_SIZE;
            if (snapshot !== 'latest' && !triedBlockNumber) {
                // @ts-ignore
                params.users.__args.block = { number: snapshot };
            }
            else {
                // @ts-ignore
                delete params.users.__args.block;
            }
            let result;
            try {
                result = await (0, utils_1.subgraphRequest)(smartChefUrl, params);
            }
            catch (error) {
                if (!triedBlockNumber) {
                    triedBlockNumber = true;
                    continue;
                }
                else {
                    throw error;
                }
            }
            if (!Array.isArray(result.users) && !triedBlockNumber) {
                triedBlockNumber = true;
                continue;
            }
            results = results.concat(result.users);
            page++;
            if (result.users.length < PAGE_SIZE)
                break;
        }
    }
    return results.reduce((acc, user) => {
        if (acc[user.address]) {
            acc[user.address] = acc[user.address].add(user.stakeAmount);
        }
        else {
            acc[user.address] = bignumber_1.BigNumber.from(user.stakeAmount);
        }
        return acc;
    }, {});
}
async function veCakeStrategy(addresses, network, provider, blockTag, options) {
    let callData = addresses.map((address) => [
        onChainVotingPower.v1.address,
        'getVotingPowerWithoutPool',
        [address.toLowerCase()]
    ]);
    callData = [...chunk(callData, options.max || 400)];
    const response = [];
    for (const call of callData) {
        const multiRes = await (0, utils_1.multicall)(network, provider, abi, call, {
            blockTag
        });
        response.push(...multiRes);
    }
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatEther)(value.toString()))
    ]));
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    if (blockTag === 'latest' ||
        (typeof blockTag === 'number' && blockTag >= veCakeBlockNumber)) {
        return veCakeStrategy(addresses, network, provider, blockTag, options);
    }
    const pools = await getPools(provider, snapshot);
    const userPoolBalance = await getSmartChefStakedCakeAmount(snapshot, pools.map((p) => p.id), addresses);
    if (typeof blockTag === 'number' &&
        blockTag >= onChainVotingPower.v0.blockNumber) {
        let callData = addresses.map((address) => [
            typeof blockTag === 'number' &&
                blockTag < onChainVotingPower.v1.blockNumber
                ? onChainVotingPower.v0.address
                : onChainVotingPower.v1.address,
            'getVotingPowerWithoutPool',
            [address.toLowerCase()]
        ]);
        callData = [...chunk(callData, options.max || 300)];
        const response = [];
        for (const call of callData) {
            const multiRes = await (0, utils_1.multicall)(network, provider, abi, call, {
                blockTag
            });
            response.push(...multiRes);
        }
        return Object.fromEntries(response.map((value, i) => [
            addresses[i],
            parseFloat((0, units_1.formatEther)((userPoolBalance[addresses[i].toLowerCase()] || constants_1.Zero).add(value.toString())))
        ]));
    }
    const erc20Balance = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, {
        address: CAKE_ADDRESS,
        symbol: 'CAKE',
        decimals: 18
    }, snapshot);
    const cakeBnbLpBalance = await (0, masterchef_pool_balance_1.strategy)(space, network, provider, addresses, {
        chefAddress: MASTER_CHEF_ADDRESS.v1,
        uniPairAddress: CAKE_BNB_LP_ADDRESS,
        pid: '251',
        symbol: 'CAKE-BNB LP',
        tokenIndex: 0
    }, snapshot);
    const cakeVaultBalance = await getVaultBalance(network, provider, addresses, blockTag);
    return Object.fromEntries(addresses.map((address) => [
        address,
        erc20Balance[address] +
            cakeBnbLpBalance[address] +
            parseFloat((0, units_1.formatEther)((userPoolBalance[address.toLowerCase()] || constants_1.Zero).add(cakeVaultBalance[address] || constants_1.Zero)))
    ]));
}
exports.strategy = strategy;
async function getVaultBalance(network, provider, addresses, blockTag) {
    const vaultMulti = new utils_1.Multicaller(network, provider, vaultAbi, { blockTag });
    vaultMulti.call(CAKE_VAULT_ADDRESS, CAKE_VAULT_ADDRESS, 'getPricePerFullShare');
    addresses.forEach((address) => vaultMulti.call(`${CAKE_VAULT_ADDRESS}-${address}`, CAKE_VAULT_ADDRESS, 'userInfo', [address]));
    if (blockTag >= IFO_POOL_START_BLOCK) {
        vaultMulti.call(IFO_POOL_ADDRESS, IFO_POOL_ADDRESS, 'getPricePerFullShare');
        addresses.forEach((address) => {
            vaultMulti.call(`${IFO_POOL_ADDRESS}-${address}`, IFO_POOL_ADDRESS, 'userInfo', [address]);
        });
    }
    const vaultMultiRes = await vaultMulti.execute();
    return Object.fromEntries(addresses.map((address) => [
        address,
        (vaultMultiRes[CAKE_VAULT_ADDRESS] || constants_1.Zero)
            .mul(vaultMultiRes[`${CAKE_VAULT_ADDRESS}-${address}`]?.shares || constants_1.Zero)
            .div(constants_1.WeiPerEther)
            .add((vaultMultiRes[IFO_POOL_ADDRESS] || constants_1.Zero)
            .mul(vaultMultiRes[`${IFO_POOL_ADDRESS}-${address}`]?.shares || constants_1.Zero)
            .div(constants_1.WeiPerEther))
    ]));
}
