"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'saffron.finance';
exports.version = '0.1.0';
const BIG18 = bignumber_1.BigNumber.from('1000000000000000000');
const VOTE_BOOST_DIV_1000 = bignumber_1.BigNumber.from(1000);
const DECIMALS = 18;
const QUERIES_PER_DEX_LP_PAIR = 2;
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getReserves',
        outputs: [
            {
                internalType: 'uint112',
                name: '_reserve0',
                type: 'uint112'
            },
            {
                internalType: 'uint112',
                name: '_reserve1',
                type: 'uint112'
            },
            {
                internalType: 'uint32',
                name: '_blockTimestampLast',
                type: 'uint32'
            }
        ],
        stateMutability: 'view',
        type: 'function',
        constant: true
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
// DirectBoostScheme provides logic to apply a multiplier, or boost, to a raw balance value. This gives
// Saffron Finance the ability to adjust the voting power a token holder has depending external configuration.
//
// name       ... unique string that identifies the instance of the VotingScheme
// multiplier ... the raw balance value is multiplied by the multiplier such that: score = (multiplier)(balance).
//                If this value is 1.0, it is equivalent to score = balance.
//                If this value is less than 1.0 and greater than 0.0, then the token holder's voting power is reduced.
//                If this value is 0.0, then the token holder has no voting power.
class DirectBoostScheme {
    // private name: string;
    multiplier;
    constructor(name, multiplier) {
        // this.name = name;
        this.multiplier = multiplier;
    }
    doAlgorithm(balance) {
        const voteBoost1000 = bignumber_1.BigNumber.from(this.multiplier * 1000);
        return balance.mul(voteBoost1000).div(VOTE_BOOST_DIV_1000);
    }
}
// LPReservePairScheme provides logic to apply a voting score to only the SFI side of a Uniswap or Sushiswap LP token
// pair.
//
// name            ... unique string that identifies the instance of the VotingScheme
// multiplier ... the raw balance value is multiplied by the multiplier such that: score = (multiplier)(balance).
//                If this value is 1.0, it is equivalent to score = balance.
//                If this value is less than 1.0 and greater than 0.0, then the token holder's voting power is reduced.
//                If this value is 0.0, then the token holder has no voting power.
// saffLpToSfi_E18 ... Conversion of the Saffron LP Pair Token holding to SFI value with expected value to be in wei.
class LPReservePairScheme {
    // private name: string;
    multiplier;
    saffLpToSfi_E18;
    constructor(name, multiplier, saffLpToSfi_E18) {
        // this.name = name;
        this.multiplier = multiplier;
        this.saffLpToSfi_E18 = saffLpToSfi_E18;
    }
    doAlgorithm(balance) {
        const voteMult1000 = bignumber_1.BigNumber.from(this.multiplier * 1000);
        const calculatedScore = balance.mul(this.saffLpToSfi_E18).div(BIG18);
        return calculatedScore.mul(voteMult1000).div(VOTE_BOOST_DIV_1000);
    }
}
// VoteScorer acts as the context to invoke the relevant VotingScheme by way of its calculateScore method.
// It assumes all VotingScheme's are created by the createVotingScheme method prior to invocation of calculateScore.
//
// votingSchemes    ...  A Map that provides keyed access to a VotingScheme instance.
// dexReserveData   ...  An Array that holds necessary Uniswap and Sushiswap LP Pair Token data for LPReservePairScheme.
class VoteScorer {
    votingSchemes = new Map();
    dexReserveData = new Array();
    constructor(dexReserveData) {
        this.dexReserveData = dexReserveData;
        this.votingSchemes.set('default', new DirectBoostScheme('default', 1.0));
    }
    createVotingScheme(name, type, multiplier) {
        let votingScheme = new DirectBoostScheme('no-vote-scheme', 0.0);
        if (type === 'DirectBoostScheme') {
            votingScheme = new DirectBoostScheme(name, multiplier);
        }
        else if (type === 'LPReservePairScheme') {
            const lpReservePairData = this.dexReserveData.find((e) => e.name === name);
            if (lpReservePairData === undefined) {
                throw Error(`Failed to locate token LP Pair data for ${name}.`);
            }
            votingScheme = new LPReservePairScheme(name, multiplier, lpReservePairData.saffLpToSFI_E18);
        }
        else {
            throw new Error(`Unsupported voting scheme type, ${type}.`);
        }
        this.votingSchemes.set(name, votingScheme);
    }
    calculateScore(schemeName, balance) {
        const votingScheme = this.votingSchemes.get(schemeName);
        if (votingScheme === undefined) {
            throw new Error(`Failed to locate voting scheme, ${schemeName}. Check initialization of votingSchemes.`);
        }
        return votingScheme.doAlgorithm(balance);
    }
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const callQueries = new Array();
    let callResponses = new Array();
    const holdersQueryBatches = new Array();
    const votingScores = new Array();
    let callQueryIndex = 0;
    // ================ LP Pair Token Reserve and Total Supply ==================
    const dexReserveData = new Array();
    options.dexLpTypes.forEach((dexToken) => {
        const d = {
            name: dexToken.name,
            reservesQuery: [dexToken.lpToken, 'getReserves'],
            reserveQueryIdx: 0,
            reserve: bignumber_1.BigNumber.from(0),
            supplyQuery: [dexToken.lpToken, 'totalSupply'],
            supplyQueryIdx: 0,
            supply: bignumber_1.BigNumber.from(0),
            saffLpToSFI_E18: bignumber_1.BigNumber.from(0)
        };
        callQueries.push(d.reservesQuery);
        d.reserveQueryIdx = callQueryIndex++;
        callQueries.push(d.supplyQuery);
        d.supplyQueryIdx = callQueryIndex++;
        dexReserveData.push(d);
    });
    // ============= Multicall queries ==============
    options.contracts.forEach((contract) => {
        const queries = addresses.map((address) => {
            return [contract.tokenAddress, 'balanceOf', [address]];
        });
        const queriesLength = callQueries.push(...queries);
        const batch = {
            tag: contract.label,
            votingScheme: contract.votingScheme,
            qIdxStart: callQueryIndex,
            qIdxEnd: queriesLength
        };
        callQueryIndex = queriesLength;
        holdersQueryBatches.push(batch);
    });
    // Run queries
    callResponses = await (0, utils_1.multicall)(network, provider, abi, callQueries, {
        blockTag
    });
    // ========== Extract and process query responses ==========
    dexReserveData.forEach((drd) => {
        drd.reserve = callResponses[drd.reserveQueryIdx][0];
        drd.supply = callResponses[drd.supplyQueryIdx][0];
        drd.saffLpToSFI_E18 = drd.reserve.mul(BIG18).div(drd.supply);
    });
    // ========== Build the voting schemes and calculate individual scores ============
    const voteScorer = new VoteScorer(dexReserveData);
    options.votingSchemes.forEach((scheme) => {
        voteScorer.createVotingScheme(scheme.name, scheme.type, scheme.multiplier);
    });
    // Push empty Voting Score elements to the votingScores array. This allows Batch.qIdxStart to
    // correspond correctly to votingScores.
    const emptyVotingScoreCountToAdd = dexReserveData.length * QUERIES_PER_DEX_LP_PAIR;
    const emptyVote = { address: '0x00', score: 0.0 };
    for (let i = 0; i < emptyVotingScoreCountToAdd; i++) {
        votingScores.push(emptyVote);
    }
    options.contracts.forEach((contract) => {
        const batch = holdersQueryBatches.find((e) => e.tag === contract.label);
        if (batch === undefined) {
            throw new Error(`Failed to locate tag, ${contract.label}, in queryBatches.`);
        }
        const idxStart = batch.qIdxStart;
        const batchScores = addresses.map((address, index) => {
            return {
                address: address,
                score: voteScorer.calculateScore(contract.votingScheme, callResponses[idxStart + index][0])
            };
        });
        votingScores.push(...batchScores);
    });
    // ================ Sum up everything =================
    const addressVotingScore = addresses.map((address, addressIndex) => {
        let total = bignumber_1.BigNumber.from(0);
        holdersQueryBatches.forEach((batch) => {
            const votingScore = votingScores[batch.qIdxStart + addressIndex];
            if (votingScore === undefined) {
                throw new Error(`Expected a votingScore at batch.qIdxStart: ${batch.qIdxStart}, addressIndex: ${addressIndex}`);
            }
            if (votingScore.address === address) {
                total = total.add(votingScore.score);
            }
            else {
                throw new Error(`${batch.tag} expected address, ${address}, found ${votingScore.address}`);
            }
        });
        // Return single record { address, score } where score should have exponent of 18
        return { address: address, score: total };
    });
    return Object.fromEntries(addressVotingScore.map((addressVote) => {
        return [
            addressVote.address,
            parseFloat((0, units_1.formatUnits)(addressVote.score, DECIMALS))
        ];
    }));
}
exports.strategy = strategy;
