"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
exports.author = 'Archethect';
exports.version = '0.0.2';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function totalSupply() external view returns (uint256)',
    'function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
    'function totalClaimableOf(address account) external view returns (uint256 total)'
];
const calcVotingPower = (stakedAsString, stakedLPAsString, vestingAsString, founderStakes, claimableOf, decimals, tokenWeight, v1VaultGFlyStaked, v2VaultGFlyStaked, totalV1FoundersStaked, totalV2FoundersStaked) => {
    const staked = parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(stakedAsString), decimals));
    const stakedLP = parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(stakedLPAsString), decimals));
    const vesting = parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(vestingAsString).sub(claimableOf), decimals));
    let v1 = 0;
    let v2 = 0;
    founderStakes.map((element) => {
        if (element.type === 'v1') {
            v1 += 1;
        }
        else if (element.type === 'v2') {
            v2 += 1;
        }
    });
    const founders = parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(v1)
        .mul(v1VaultGFlyStaked.div(totalV1FoundersStaked))
        .add(bignumber_1.BigNumber.from(v2).mul(v2VaultGFlyStaked.div(totalV2FoundersStaked))), decimals));
    return staked + vesting + stakedLP * tokenWeight + founders;
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const DF_SUBGRAPH_URL = options.graphUrl;
    // Setup subgraph query to fetch vgFLY and staked gFLY amounts (both normal and LP) per address
    const params = {
        _meta: {
            block: {
                number: true
            }
        },
        accounts: {
            __args: {
                where: {
                    id_in: addresses.map((addr) => addr.toLowerCase())
                },
                first: 1000
            },
            founderStakes: {
                __args: {
                    first: 1000
                },
                type: true
            },
            id: true,
            staked: true,
            stakedLP: true,
            vesting: true
        }
    };
    // Setup subgraph query to fetch amount of gFLY staked by V1 and V2 vaults
    const paramsV1AndV2 = {
        _meta: {
            block: {
                number: true
            }
        },
        accounts: {
            __args: {
                where: {
                    id_in: [
                        options.v1FoundersVault.toLowerCase(),
                        options.v2FoundersVault.toLowerCase()
                    ]
                }
            },
            id: true,
            staked: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.accounts.__args.block = { number: snapshot };
        // @ts-ignore
        paramsV1AndV2.accounts.__args.block = params.accounts.__args.block;
    }
    const result = await (0, utils_1.subgraphRequest)(DF_SUBGRAPH_URL, {
        ...params
    });
    const resultV1andV2 = await (0, utils_1.subgraphRequest)(DF_SUBGRAPH_URL, {
        ...paramsV1AndV2
    });
    // Take the same block number than from subgraph for consistency
    const blockTag = typeof snapshot === 'number' ? snapshot : result._meta.block.number;
    // fetch all token and lp contract data
    const fetchContractData = await (0, utils_1.multicall)(network, provider, abi, [
        [options.lpAddress, 'token0', []],
        [options.lpAddress, 'token1', []],
        [options.lpAddress, 'getReserves', []],
        [options.lpAddress, 'totalSupply', []],
        [options.lpAddress, 'decimals', []],
        [options.foundersToken, 'balanceOf', [options.v1FoundersVault]],
        [options.foundersToken, 'balanceOf', [options.v2FoundersVault]]
    ], { blockTag });
    // assign multicall data to variables
    const token0Address = fetchContractData[0][0];
    const token1Address = fetchContractData[1][0];
    const lpTokenReserves = fetchContractData[2];
    const lpTokenTotalSupply = fetchContractData[3][0];
    const lpTokenDecimals = fetchContractData[4][0];
    const totalV1FoundersStaked = fetchContractData[5][0];
    const totalV2FoundersStaked = fetchContractData[6][0];
    // calculate single lp token weight
    let tokenWeight;
    //For token weight we only take the gFLY part into account
    if (token0Address === options.gFLYAddress) {
        tokenWeight =
            parseFloat((0, units_1.formatUnits)(lpTokenReserves._reserve0, options.decimals)) /
                parseFloat((0, units_1.formatUnits)(lpTokenTotalSupply, lpTokenDecimals));
    }
    else if (token1Address === options.gFLYAddress) {
        tokenWeight =
            parseFloat((0, units_1.formatUnits)(lpTokenReserves._reserve1, options.decimals)) /
                parseFloat((0, units_1.formatUnits)(lpTokenTotalSupply, lpTokenDecimals));
    }
    else {
        tokenWeight = 0;
    }
    // Make sure vested vgFLY which is claimable is not counted
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.vgFLYAddress, 'totalClaimableOf', [address]));
    const claimableOfResult = await multi.execute();
    let v1VaultGFlyStaked;
    let v2VaultGFlyStaked;
    resultV1andV2.accounts.map((element) => {
        if (element.id === options.v1FoundersVault.toLowerCase()) {
            v1VaultGFlyStaked = bignumber_1.BigNumber.from(element.staked);
        }
        else if (element.id === options.v2FoundersVault.toLowerCase()) {
            v2VaultGFlyStaked = bignumber_1.BigNumber.from(element.staked);
        }
    });
    return Object.fromEntries(result.accounts.map((a) => [
        (0, address_1.getAddress)(a.id),
        calcVotingPower(a.staked, a.stakedLP, a.vesting, a.founderStakes, claimableOfResult[(0, address_1.getAddress)(a.id)], options.decimals, tokenWeight, v1VaultGFlyStaked, v2VaultGFlyStaked, bignumber_1.BigNumber.from(totalV1FoundersStaked), bignumber_1.BigNumber.from(totalV2FoundersStaked))
    ]));
}
exports.strategy = strategy;
