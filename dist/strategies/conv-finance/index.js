"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'eric-convergence';
exports.version = '0.1.0';
const lpTokenContractAbi = [
    'function getReserves() public view returns (uint112, uint112, uint32)',
    'function token0() public view returns (address)',
    'function token1() public view returns (address)',
    'function balanceOf(address account) view returns (uint256)',
    'function totalSupply() public view returns (uint256)'
];
const stakingPoolsV2ContractAbi = [
    'function getReward(uint256 poolId, address staker, uint8 rewarderIdx) external view returns (uint256)',
    'function userData(uint256 poolId, address staker) view returns (uint256, uint32)',
    'function poolInfos(uint256 poolId) view returns (uint256, uint256, uint256, address)'
];
const rewarderV2ContractAbi = [
    'function calculateTotalReward(address user, uint256 poolId) external view returns (uint256)'
];
const stakingPoolsV1ContractAbi = [
    'function getReward(uint256 poolId, address staker) external view returns (uint256)',
    'function userData(uint256 poolId, address staker) view returns (uint256, uint256, uint256)',
    'function poolInfos(uint256 poolId) view returns (uint256, uint256, uint256, uint256, address)'
];
const rewarderV1ContractAbi = [
    'function vestingSchedules(address user, uint256 poolId) view returns(uint128, uint32, uint32, uint32, uint32)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const lpMultiCalls = options.lpTokenAddresses.flatMap((lpAddress) => {
        return [
            [lpAddress, 'token0', []],
            [lpAddress, 'token1', []],
            [lpAddress, 'getReserves', []],
            [lpAddress, 'totalSupply', []],
            ...addresses.map((userAddress) => [
                lpAddress,
                'balanceOf',
                [userAddress]
            ])
        ];
    });
    const stakingPoolsMultiCalls = [];
    options.stakingPools.forEach((stakingPool) => {
        // Staking pool version:
        // 1: Single reward
        // 2: Multi reward
        if (options.stakingPoolsVersion === '2') {
            stakingPool.pools.forEach((poolInfo) => {
                stakingPoolsMultiCalls.push([stakingPool.address, 'poolInfos', [poolInfo.poolId]], // Get pool token
                ...addresses.map((userAddress) => [
                    stakingPool.address,
                    'userData',
                    [poolInfo.poolId, userAddress]
                ]), ...addresses.map((userAddress) => [
                    stakingPool.address,
                    'getReward',
                    [poolInfo.poolId, userAddress, poolInfo.rewarderIdx]
                ]));
            });
        }
        else {
            stakingPool.pools.forEach((poolInfo) => {
                stakingPoolsMultiCalls.push([stakingPool.address, 'poolInfos', [poolInfo.poolId]], // Get pool token
                ...addresses.map((userAddress) => [
                    stakingPool.address,
                    'userData',
                    [poolInfo.poolId, userAddress]
                ]), ...addresses.map((userAddress) => [
                    stakingPool.address,
                    'getReward',
                    [poolInfo.poolId, userAddress]
                ]));
            });
        }
    });
    const stakingPoolRewarderMultiCalls = [];
    options.rewarder.forEach((rewarder) => {
        //  Staking pool rewarder version:
        // 1: Old rewarder
        // 2. New rewarder
        if (options.rewarderVersion === '2') {
            rewarder.poolIds.forEach((id) => {
                stakingPoolRewarderMultiCalls.push(...addresses.map((userAddress) => [
                    rewarder.address,
                    'calculateTotalReward',
                    [userAddress, id]
                ]));
            });
        }
        else {
            rewarder.poolIds.forEach((id) => {
                stakingPoolRewarderMultiCalls.push(...addresses.map((userAddress) => [
                    rewarder.address,
                    'vestingSchedules',
                    [userAddress, id]
                ]));
            });
        }
    });
    const promiseArray = [
        (0, utils_1.multicall)(network, provider, lpTokenContractAbi, lpMultiCalls, { blockTag })
    ];
    if (options.stakingPoolsVersion === '2') {
        promiseArray.push((0, utils_1.multicall)(network, provider, stakingPoolsV2ContractAbi, stakingPoolsMultiCalls, { blockTag }));
    }
    else {
        promiseArray.push((0, utils_1.multicall)(network, provider, stakingPoolsV1ContractAbi, stakingPoolsMultiCalls, { blockTag }));
    }
    if (options.rewarderVersion === '2') {
        promiseArray.push((0, utils_1.multicall)(network, provider, rewarderV2ContractAbi, stakingPoolRewarderMultiCalls, { blockTag }));
    }
    else {
        promiseArray.push((0, utils_1.multicall)(network, provider, rewarderV1ContractAbi, stakingPoolRewarderMultiCalls, { blockTag }));
    }
    const res = await Promise.all(promiseArray);
    const usersTokensFromLp = [];
    const lpTokens = {};
    // LP Token Calculation
    let lpTokenResult = res[0];
    options.lpTokenAddresses.forEach((lpAddress, idx) => {
        const token0Addr = lpTokenResult[0][0];
        const token1Addr = lpTokenResult[1][0];
        const reserve0 = bn(lpTokenResult[2][0]);
        const reserve1 = bn(lpTokenResult[2][1]);
        const totalSupply = bn(lpTokenResult[3][0]);
        lpTokenResult = lpTokenResult.slice(4);
        let tokenInLP = bn(0);
        if (token0Addr === options.address) {
            tokenInLP = reserve0.mul(bn(2));
        }
        else if (token1Addr === options.address) {
            tokenInLP = reserve1.mul(bn(2));
        }
        lpTokenResult
            .slice(0, addresses.length)
            .map((num, i) => {
            const lpTokenBal = bn(num[0]);
            if (usersTokensFromLp[i] === undefined) {
                usersTokensFromLp[i] = lpTokenBal.mul(tokenInLP).div(totalSupply);
            }
            else {
                usersTokensFromLp[i] = usersTokensFromLp[i].add(lpTokenBal.mul(tokenInLP).div(totalSupply));
            }
        });
        lpTokens[options.lpTokenAddresses[idx].toLowerCase()] = {
            totalSupply,
            totalToken: tokenInLP
        };
        lpTokenResult = lpTokenResult.slice(addresses.length);
    });
    let stakingPoolResult = res[1];
    // Staking Pools Calculation
    options.stakingPools.forEach((stakingPool) => {
        stakingPool.pools.forEach(() => {
            let poolToken = '';
            if (options.stakingPoolsVersion === '2') {
                poolToken = stakingPoolResult[0][3];
            }
            else {
                poolToken = stakingPoolResult[0][4];
            }
            stakingPoolResult = stakingPoolResult.slice(1);
            if (poolToken === options.address) {
                // single side staking
                stakingPoolResult.slice(0, addresses.length).map((userData, idx) => {
                    const stakingBal = bn(userData[0]);
                    usersTokensFromLp[idx] = usersTokensFromLp[idx].add(stakingBal);
                });
                stakingPoolResult = stakingPoolResult.slice(addresses.length);
                stakingPoolResult.slice(0, addresses.length).map((num, idx) => {
                    const pendingReward = bn(num);
                    usersTokensFromLp[idx] = usersTokensFromLp[idx].add(pendingReward);
                });
            }
            else if (lpTokens[poolToken.toLowerCase()] !== undefined) {
                // CONV LP token staking
                const totalSupply = lpTokens[poolToken.toLowerCase()].totalSupply;
                const totalToken = lpTokens[poolToken.toLowerCase()].totalToken;
                stakingPoolResult.slice(0, addresses.length).map((userData, idx) => {
                    const stakedLPBal = bn(userData[0]);
                    usersTokensFromLp[idx] = usersTokensFromLp[idx].add(stakedLPBal.mul(totalToken).div(totalSupply));
                });
                stakingPoolResult = stakingPoolResult.slice(addresses.length);
                stakingPoolResult.slice(0, addresses.length).map((num, idx) => {
                    const pendingReward = bn(num);
                    usersTokensFromLp[idx] = usersTokensFromLp[idx].add(pendingReward);
                });
            }
            else {
                // Non-CONV LP token staking, only calculates pending reward
                stakingPoolResult = stakingPoolResult.slice(addresses.length);
                stakingPoolResult.slice(0, addresses.length).map((num, idx) => {
                    const pendingReward = bn(num);
                    usersTokensFromLp[idx] = usersTokensFromLp[idx].add(pendingReward);
                });
            }
            stakingPoolResult = stakingPoolResult.slice(addresses.length);
        });
    });
    let rewarderResult = res[2];
    // Rewarder Calculation
    options.rewarder.forEach((rewarder) => {
        rewarder.poolIds.forEach(() => {
            if (options.rewarderVersion === '2') {
                rewarderResult.slice(0, addresses.length).map((num, i) => {
                    const rewarderBal = bn(num);
                    usersTokensFromLp[i] = usersTokensFromLp[i].add(rewarderBal);
                });
            }
            else {
                rewarderResult.slice(0, addresses.length).map((vestingSchedule, i) => {
                    const vestingAmount = bn(vestingSchedule[0]);
                    if (vestingAmount.gt(bn(0))) {
                        const startTime = parseInt(vestingSchedule[1]);
                        const endTime = parseInt(vestingSchedule[2]);
                        const lastClaimTime = parseInt(vestingSchedule[4]);
                        const step = parseInt(vestingSchedule[3]);
                        const totalStep = (endTime - startTime) / step;
                        const remainingStep = (endTime - lastClaimTime) / step;
                        const rewarderBal = vestingAmount
                            .div(bn(totalStep))
                            .mul(bn(remainingStep));
                        usersTokensFromLp[i] = usersTokensFromLp[i].add(rewarderBal);
                    }
                });
            }
            rewarderResult = rewarderResult.slice(addresses.length);
        });
    });
    return Object.fromEntries(usersTokensFromLp.map((sum, i) => {
        const parsedSum = parseFloat((0, units_1.formatUnits)(sum, options.decimals));
        return [addresses[i], parsedSum];
    }));
}
exports.strategy = strategy;
