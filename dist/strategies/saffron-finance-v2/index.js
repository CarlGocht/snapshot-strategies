"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'turpintinz';
exports.version = '2.0.1';
const SAFF_STAKING_V2 = '0x4eB4C5911e931667fE1647428F38401aB1661763';
const SFI = '0xb753428af26E81097e7fD17f40c88aaA3E04902c';
const SFI_DECIMALS = 18;
const SINGLE_ASSETS_DEFAULT = [SFI];
const tenTo18 = bignumber_1.BigNumber.from(10).pow(18);
const STAKING_VOTE_BOOST_DEFAULT = 1.1;
// ============ Needed contract ABI ============
const abi = [
    'function balanceOf(address account) view returns (uint256)',
    'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
    'function poolLength() view returns (uint256)',
    'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSFIPerShare)',
    'function totalSupply() view returns (uint256)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    const pools = new Array();
    const stakingPool = options.stakingPool
        ? options.stakingPool
        : SAFF_STAKING_V2;
    const singleAssets = options.singleAssets
        ? options.singleAssets
        : SINGLE_ASSETS_DEFAULT;
    const votingDecimals = options.decimals ? options.decimals : SFI_DECIMALS;
    // ========== Prepare pools' lp token data ==========
    multi.call('poolLength', stakingPool, 'poolLength', []);
    const poolLenResult = await multi.execute();
    const poolLength = bignumber_1.BigNumber.from(poolLenResult.poolLength).toNumber();
    for (let i = 0; i < poolLength; i++) {
        const path = `poolInfo[${i}]`;
        multi.call(path, stakingPool, 'poolInfo', [bignumber_1.BigNumber.from(i)]);
    }
    const poolInfoResults = await multi.execute();
    for (let i = 0; i < poolLength; i++) {
        const lp = {
            lpAddress: poolInfoResults.poolInfo[i].lpToken,
            token0: '',
            token1: '',
            sfiReserve: bignumber_1.BigNumber.from(0),
            totalSupply: bignumber_1.BigNumber.from(0)
        };
        const pool = {
            id: bignumber_1.BigNumber.from(i),
            lpToken: lp
        };
        pools.push(pool);
    }
    for (let i = 0; i < poolLength; i++) {
        const lpAddress = pools[i].lpToken.lpAddress;
        if (singleAssets.find((item) => item.toLowerCase() === lpAddress.toLowerCase())) {
            multi.call(`reserves[${i}]`, lpAddress, 'balanceOf', [stakingPool]);
            multi.call(`supply[${i}]`, lpAddress, 'totalSupply', []);
        }
        else {
            multi.call(`token0[${i}]`, lpAddress, 'token0', []);
            multi.call(`token1[${i}]`, lpAddress, 'token1', []);
            multi.call(`reserves[${i}]`, lpAddress, 'getReserves', []);
            multi.call(`supply[${i}]`, lpAddress, 'totalSupply', []);
        }
    }
    const reservesResult = await multi.execute();
    for (let i = 0; i < poolLength; i++) {
        const pool = pools[i];
        if (singleAssets.find((item) => item.toLowerCase() === pool.lpToken.lpAddress.toLowerCase())) {
            pool.lpToken.sfiReserve = reservesResult.reserves[i];
        }
        else {
            let sfiReserve = bignumber_1.BigNumber.from(0);
            if (reservesResult.token0[i] === SFI ||
                reservesResult.token1[i] === SFI) {
                sfiReserve =
                    reservesResult.token0[i] === SFI
                        ? reservesResult.reserves[i]._reserve0
                        : reservesResult.reserves[i]._reserve1;
            }
            pool.lpToken.token0 = reservesResult.token0[i];
            pool.lpToken.token1 = reservesResult.token1[i];
            pool.lpToken.sfiReserve = sfiReserve;
        }
        pool.lpToken.totalSupply = reservesResult.supply[i];
    }
    // ====== retrieve user info for each pool ============
    addresses.forEach((address) => {
        pools.forEach((pool) => multi.call(`userInfo.${address}[${pool.id.toNumber()}]`, stakingPool, 'userInfo', [pool.id, address]));
    });
    const userInfoResult = await multi.execute();
    // =========== Calculate voting power for each user account ==========
    const result = new Map();
    addresses.forEach((address) => {
        let total = bignumber_1.BigNumber.from(0);
        pools.forEach((pool) => {
            const userInfo = userInfoResult.userInfo[`${address}`][pool.id.toNumber()];
            let poolTotal;
            if (singleAssets.find((item) => item.toLowerCase() === pool.lpToken.lpAddress.toLowerCase())) {
                poolTotal = userInfo.amount;
            }
            else {
                poolTotal = userInfo.amount
                    .mul(tenTo18)
                    .mul(pools[pool.id.toNumber()].lpToken.sfiReserve)
                    .div(pools[pool.id.toNumber()].lpToken.totalSupply)
                    .div(tenTo18);
            }
            total = total.add(poolTotal);
        });
        result.set(address, total);
    });
    const formatted = new Map();
    const votingMultiplier = 'multiplier' in options ? options.multiplier : STAKING_VOTE_BOOST_DEFAULT;
    result.forEach((balance, address) => {
        const rawVote = parseFloat((0, units_1.formatUnits)(balance, votingDecimals));
        const calculatedVote = rawVote * votingMultiplier;
        formatted.set(address, calculatedVote);
    });
    return Object.fromEntries(formatted);
}
exports.strategy = strategy;
