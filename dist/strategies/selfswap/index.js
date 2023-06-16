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
exports.author = 'Cr3k';
exports.version = '0.0.1';
const SELF_ADDRESS = '0x7a364484303b38bce7b0ab60a20da8f2f4370129';
const SELF_VAULT_ADDRESS = '0xeb4f1307DE7DF263E8e54d083fE7db1e281e710D';
const SELF_BNB_LP_ADDRESS = '0x9C6FF656A563Ec9057460D8a400E2AC7c2AE0a1C';
const MASTER_CHEF_ADDRESS = {
    v1: '0x3d03d12F95Bdc4509804f9Bcee4139b7789DC516'
};
const vaultAbi = [
    'function getPricePerFullShare() view returns (uint256)',
    'function userInfo(address) view returns (uint256 shares, uint256 lastDepositedTime, uint256 selfAtLastUserAction, uint256 lastUserActionTime)'
];
const smartChefUrl = 'https://api.thegraph.com/subgraphs/name/cr3k/smartchef';
async function getPools(provider, snapshot) {
    let blockNumber = snapshot;
    if (blockNumber === 'latest') {
        blockNumber = await provider.getBlockNumber();
    }
    const params = {
        smartChefs: {
            __args: {
                where: {
                    stakeToken: SELF_ADDRESS.toLowerCase(),
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
async function getSmartChefStakedSELFAmount(snapshot, poolAddresses, addresses) {
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
async function strategy(space, network, provider, addresses, options, snapshot) {
    const pools = await getPools(provider, snapshot);
    const userPoolBalance = await getSmartChefStakedSELFAmount(snapshot, pools.map((p) => p.id), addresses);
    const blockTag = snapshot;
    const erc20Balance = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, {
        address: SELF_ADDRESS,
        symbol: 'SELF',
        decimals: 18
    }, snapshot);
    const selfBnbLpBalance = await (0, masterchef_pool_balance_1.strategy)(space, network, provider, addresses, {
        chefAddress: MASTER_CHEF_ADDRESS.v1,
        uniPairAddress: SELF_BNB_LP_ADDRESS,
        pid: '251',
        symbol: 'SELF-BNB LP',
        tokenIndex: 0
    }, snapshot);
    const selfVaultBalance = await getVaultBalance(network, provider, addresses, blockTag);
    return Object.fromEntries(addresses.map((address) => [
        address,
        erc20Balance[address] +
            selfBnbLpBalance[address] +
            parseFloat((0, units_1.formatEther)((userPoolBalance[address.toLowerCase()] || constants_1.Zero).add(selfVaultBalance[address] || constants_1.Zero)))
    ]));
}
exports.strategy = strategy;
async function getVaultBalance(network, provider, addresses, blockTag) {
    const vaultMulti = new utils_1.Multicaller(network, provider, vaultAbi, { blockTag });
    vaultMulti.call(SELF_VAULT_ADDRESS, SELF_VAULT_ADDRESS, 'getPricePerFullShare');
    addresses.forEach((address) => vaultMulti.call(`${SELF_VAULT_ADDRESS}-${address}`, SELF_VAULT_ADDRESS, 'userInfo', [address]));
    const vaultMultiRes = await vaultMulti.execute();
    return Object.fromEntries(addresses.map((address) => [
        address,
        (vaultMultiRes[SELF_VAULT_ADDRESS] || constants_1.Zero)
            .mul(vaultMultiRes[`${SELF_VAULT_ADDRESS}-${address}`]?.shares || constants_1.Zero)
            .div(constants_1.WeiPerEther)
    ]));
}
