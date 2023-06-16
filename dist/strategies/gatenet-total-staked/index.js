"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
exports.author = 'usagar80';
exports.version = '0.0.2';
const UNSTAKE = 'Unstake';
const STAKE = 'Stake';
const FEE_DISTRIBUTION = 'Fee distribution';
const REWARD_ADDED = 'Reward';
const CLAIM = 'Claim';
const OTHERS = 'others';
const abi = ['function LOCK_PERIOD() view returns (uint256)'];
const getTransactionType = (transaction) => {
    switch (transaction.__typename) {
        case 'Staking':
            if (transaction.txName === 'FeeDistribution') {
                return FEE_DISTRIBUTION;
            }
            else if (transaction.txName === 'RewardAdded') {
                return REWARD_ADDED;
            }
            else if (transaction.txName === 'Claim') {
                return CLAIM;
            }
            return OTHERS;
        case 'CompoundDeposit':
            return STAKE;
        default:
            return UNSTAKE;
    }
};
//gatenet-total-staked
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('lockPeriod', options.address, 'LOCK_PERIOD');
    const multiResult = await multi.execute();
    const lockPeriod = Number(multiResult.lockPeriod);
    const result = {};
    const args = {
        where: {
            sender_in: addresses
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        args.where.time_lte = (await provider.getBlock(snapshot)).timestamp;
    }
    const query = {
        compoundDeposits: {
            __args: args,
            __typename: true,
            id: true,
            sender: true,
            amount: true,
            shares: true,
            time: true
        },
        compoundWithdraws: {
            __args: args,
            __typename: true,
            id: true,
            sender: true,
            amount: true,
            shares: true,
            time: true
        },
        stakings: {
            __typename: true,
            id: true,
            txName: true,
            amount: true,
            user: true,
            time: true,
            unStakeIndex: true
        }
    };
    const transactionsList = await (0, utils_1.subgraphRequest)(options.subgraph, query);
    for (const address of addresses) {
        let feePerShare = bignumber_1.BigNumber.from(0);
        let rewardRate = bignumber_1.BigNumber.from(0);
        let waitingFees = bignumber_1.BigNumber.from(0);
        let waitingRewards = bignumber_1.BigNumber.from(0);
        let currentShares = bignumber_1.BigNumber.from(0);
        let transactionTypeTemp = '';
        const ether = bignumber_1.BigNumber.from(10).pow(18);
        const compoundDeposits = transactionsList.compoundDeposits.filter((s) => s.sender.toLowerCase() === address.toLowerCase());
        const compoundWithdraws = transactionsList.compoundWithdraws.filter((s) => s.sender.toLowerCase() === address.toLowerCase());
        if (compoundDeposits.length > 0) {
            let rawTransactions;
            // Keeping split condition for the case of Only deposite transaction.
            if (compoundWithdraws.length > 0) {
                rawTransactions = compoundDeposits
                    .concat(compoundWithdraws)
                    .concat(transactionsList.stakings)
                    .sort(function (a, b) {
                    return a.time - b.time;
                });
            }
            else {
                rawTransactions = compoundDeposits
                    .concat(transactionsList.stakings)
                    .sort(function (a, b) {
                    return a.time - b.time;
                });
            }
            const transactions = rawTransactions
                .map((transaction) => {
                const type = getTransactionType(transaction);
                if (type !== OTHERS) {
                    let amount;
                    switch (type) {
                        case STAKE: {
                            currentShares = bignumber_1.BigNumber.from(transaction.shares).add(currentShares);
                            amount = bignumber_1.BigNumber.from(transaction.amount);
                            break;
                        }
                        case FEE_DISTRIBUTION: {
                            const totalShares = bignumber_1.BigNumber.from(transaction.unStakeIndex);
                            const transactionAmount = bignumber_1.BigNumber.from(transaction.amount);
                            const previousFeePerShare = feePerShare;
                            /// 0
                            feePerShare = previousFeePerShare.add(transactionAmount.mul(ether).div(totalShares));
                            // 0
                            amount = currentShares.mul(feePerShare.sub(previousFeePerShare).div(ether));
                            waitingFees = waitingFees.add(amount);
                            break;
                        }
                        case REWARD_ADDED: {
                            const rewardRateIncrease = bignumber_1.BigNumber.from(transaction.unStakeIndex);
                            const previousRewardRate = rewardRate;
                            rewardRate = rewardRate
                                .add(rewardRateIncrease)
                                .add(previousRewardRate);
                            amount = currentShares.mul(rewardRate.sub(previousRewardRate));
                            waitingRewards = waitingRewards.add(amount);
                            break;
                        }
                        case UNSTAKE: {
                            currentShares = currentShares.sub(bignumber_1.BigNumber.from(transaction.shares || 0));
                            amount = bignumber_1.BigNumber.from(transaction.amount);
                            break;
                        }
                        case 'Claim': {
                            if (transaction.user.toUpperCase() === address.toUpperCase()) {
                                if (transactionTypeTemp !== UNSTAKE) {
                                    amount = bignumber_1.BigNumber.from(transaction.amount);
                                }
                            }
                            break;
                        }
                    }
                    transactionTypeTemp = type;
                    return amount
                        ? {
                            name: type,
                            timeStamp: transaction.time,
                            amount
                        }
                        : null;
                }
            })
                .filter((transaction) => transaction)
                .reverse();
            // Copied Content Start
            const firstUnstakeIndex = transactions.findIndex((x) => x.name === UNSTAKE);
            let filtered = transactions;
            if (firstUnstakeIndex >= 0)
                filtered = transactions.slice(0, firstUnstakeIndex);
            const stake = filtered
                .filter((t) => t.name === STAKE)
                .reduce((acc, transaction) => {
                return bignumber_1.BigNumber.from(transaction.amount).add(acc);
            }, bignumber_1.BigNumber.from(0));
            const firstUnstaked = transactions[firstUnstakeIndex];
            let lockedTransaction = transactions
                .slice(firstUnstakeIndex)
                .filter((t) => firstUnstaked &&
                firstUnstaked.timeStamp - t.timeStamp <= lockPeriod &&
                t.name === STAKE)
                .reduce((acc, t) => {
                return bignumber_1.BigNumber.from(t.amount).add(acc);
            }, bignumber_1.BigNumber.from(0));
            if (!lockedTransaction)
                lockedTransaction = 0;
            result[address] = bignumber_1.BigNumber.from(0).add(stake).add(lockedTransaction);
        }
        else {
            result[address] = bignumber_1.BigNumber.from(0);
        }
    }
    const score = Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
    Object.keys(score).forEach((key) => {
        if (score[key] >= (options.minBalance || 0))
            score[key] = score[key];
        else
            score[key] = 0;
    });
    return score;
}
exports.strategy = strategy;
