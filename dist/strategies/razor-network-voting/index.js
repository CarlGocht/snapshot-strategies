"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'razor-network';
exports.version = '0.1.0';
const RAZOR_NETWORK_SUBGRAPH_URL = 'https://graph-indexer.razorscan.io/subgraphs/name/razor/razor';
// a method to calculate corresponding razor amount for delegators
function sRZR_to_RZR(stake, totalSupply, amount) {
    try {
        return stake.mul(amount).div(totalSupply);
    }
    catch (err) {
        return bignumber_1.BigNumber.from(0);
        // do nothing
    }
}
function wei_to_ether(amount) {
    return amount / 10 ** 18;
}
async function strategy(space, network, provider, addresses, options, 
//symbol: string,
snapshot) {
    const params = {
        delegators: {
            __args: {
                where: {
                    delegatorAddress_in: addresses
                } // delegatorAddress
            },
            staker: {
                totalSupply: true,
                stake: true,
                staker: true
            },
            delegatorAddress: true,
            sAmount: true
        },
        stakers: {
            __args: {
                where: {
                    staker_in: addresses //  stakerAddress
                }
            },
            stake: true,
            totalSupply: true,
            staker: true,
            sAmount: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.delegators.__args.block = { number: snapshot };
    }
    const score = {};
    // subgraph request 1 : it fetches all the details of the stakers and delegators.
    const result = await (0, utils_1.subgraphRequest)(RAZOR_NETWORK_SUBGRAPH_URL, params);
    if (result.delegators || result.stakers) {
        result.delegators.forEach(async (delegator) => {
            const razor_amount = sRZR_to_RZR(bignumber_1.BigNumber.from(delegator.sAmount), bignumber_1.BigNumber.from(delegator.staker.totalSupply), bignumber_1.BigNumber.from(delegator.staker.stake));
            if ((0, address_1.getAddress)(delegator.delegatorAddress) !=
                (0, address_1.getAddress)(delegator.staker.staker)) {
                //if delegator has delegated to more than one staker, we need to add that amount also to calculate score.
                if (!score[(0, address_1.getAddress)(delegator.delegatorAddress)]) {
                    //if score[delegator] has no score setup already we will put it as intial amount
                    score[(0, address_1.getAddress)(delegator.delegatorAddress)] = wei_to_ether(Number(razor_amount));
                }
                else {
                    // update the score of delegator by adding new Stoken -> razor Value
                    score[(0, address_1.getAddress)(delegator.delegatorAddress)] += wei_to_ether(Number(razor_amount));
                }
            }
        });
        // for stakers
        result.stakers.forEach(async (Staker) => {
            const razor_amount = sRZR_to_RZR(bignumber_1.BigNumber.from(Staker.sAmount), bignumber_1.BigNumber.from(Staker.totalSupply), bignumber_1.BigNumber.from(Staker.stake));
            //score will be based on the current stake in the block Number
            if (!score[(0, address_1.getAddress)(Staker.staker)]) {
                //if score[delegator] has no score setup already we will put it as intial amount
                score[(0, address_1.getAddress)(Staker.staker)] = wei_to_ether(Number(razor_amount));
            }
            else {
                // update the score of delegator by adding new Stoken -> razor Value
                score[(0, address_1.getAddress)(Staker.staker)] += wei_to_ether(Number(razor_amount));
            }
        });
    }
    // it returns the array of scores.
    return score || {};
}
exports.strategy = strategy;
