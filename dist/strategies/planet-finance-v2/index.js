"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'defininja';
exports.version = '0.1.0';
//abi
// v3 farm abi for user-info
const planetFinanceV3FarmAbi = [
    'function userInfo(uint256, address) view returns (uint256, uint256,  uint256,  uint256)'
];
// erc20 abi for total supply and balance of
const bep20Abi = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)'
];
//v2 aqua infinity pool abi
const aquaInfinityAbi = [
    'function getUserGtokenBal(address) view returns (uint256)'
];
//addresses
const aquaAddress = '0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991'; //aqua token address
const aquaBnbLpTokenAddress = '0x03028D2F8B275695A1c6AFB69A4765e3666e36d9'; //v2 aqua-bnb lp token address
const aquaInfinityAddress = '0xddd0626BB795BdF9CfA925da5102eFA5E7008114'; //v2 aqua infinity pool address
const v3FarmAddress = '0x405960AEAad7Ec8B419DEdb511dfe9D112dFc22d'; //v3 farm address
const aquaBtcbLpTokenAddress = '0x70B606c23D6E786BE7accAf31C8fEcEaf846AdF3'; // v3 aqua-btcb lp token address
const increase_in_voting = 5; //increase weight 5 times while voting
const gAquaExchangeRate = '200000000416761667681474308'; //exchange rate of gAqua to aqua
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const erc20Multi = new utils_2.Multicaller(network, provider, bep20Abi, {
        blockTag
    });
    // returns user's aqua balance for their wallet address
    let score = (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    //returns user's shares  in aqua auto comp vault
    let usergAquaBalInAquaInfinityVault = (0, utils_1.multicall)(network, provider, aquaInfinityAbi, addresses.map((address) => [
        aquaInfinityAddress,
        'getUserGtokenBal',
        [address]
    ]), { blockTag });
    // returns user's shares in v3 aqua-btcb pool
    let usersNewAquaBtcbVaultBalances = (0, utils_1.multicall)(network, provider, planetFinanceV3FarmAbi, addresses.map((address) => [
        v3FarmAddress,
        'userInfo',
        ['1', address]
    ]), { blockTag });
    // returns user's aqua balance in aqua pool
    let usersNewAquaPoolBalances = (0, utils_1.multicall)(network, provider, planetFinanceV3FarmAbi, addresses.map((address) => [
        v3FarmAddress,
        'userInfo',
        ['2', address]
    ]), { blockTag });
    // get all results
    const result = await Promise.all([
        score,
        usergAquaBalInAquaInfinityVault,
        usersNewAquaBtcbVaultBalances,
        usersNewAquaPoolBalances
    ]);
    score = result[0]; //aqua balance of user's wallet address
    usergAquaBalInAquaInfinityVault = result[1]; //aqua balance of infinitiy vault
    usersNewAquaBtcbVaultBalances = result[2]; //shares in v3 aqua-btcb pool
    usersNewAquaPoolBalances = result[3]; // shares in v3 aqua pool
    //AQUA-BNB
    // total supply of v2 aqua bnb lp token
    erc20Multi.call('aquaBnbTotalSupply', aquaBnbLpTokenAddress, 'totalSupply');
    // aqua balance of v2 aqua bnb lp
    erc20Multi.call('aquaBnbAquaBal', aquaAddress, 'balanceOf', [
        aquaBnbLpTokenAddress
    ]);
    //AQUA-BTCB
    // total supply of v3 aqua btcb lp token
    erc20Multi.call('aquaBtcbTotalSupply', aquaBtcbLpTokenAddress, 'totalSupply');
    // aqua balance of v3 aqua btcb lp
    erc20Multi.call('aquaBtcbAquaBal', aquaAddress, 'balanceOf', [
        aquaBtcbLpTokenAddress
    ]);
    // execute multi calls
    const erc20Result = await erc20Multi.execute();
    // total supply of v3 aqua btcb lp token
    const totalSupplyAquabtcb = erc20Result.aquaBtcbTotalSupply.toString();
    // aqua balance of v3 aqua btcb lp
    const contractAquaBtcbBalance = erc20Result.aquaBtcbAquaBal.toString();
    const res = Object.fromEntries(Object.entries(score).map((address, index) => {
        /*
        user's voting score  = user's wallet aqua balance + aqua balance in v2 aqua-bnb pool + 5 times the aqua balance in v2 infinity vault  +
        aqua balance in lending + 5 times the aqua balance in v3 aqua pool + aqua balance in v3 aqua-btcb pool
        */
        return [
            address[0],
            address[1] +
                parseFloat((0, units_1.formatUnits)(usergAquaBalInAquaInfinityVault[index].toString(), 18)) *
                    parseFloat((0, units_1.formatUnits)(gAquaExchangeRate, 18)) *
                    increase_in_voting +
                increase_in_voting *
                    parseFloat((0, units_1.formatUnits)(usersNewAquaPoolBalances[index]['2'].toString(), 18)) +
                (parseFloat((0, units_1.formatUnits)(usersNewAquaBtcbVaultBalances[index]['2'].toString(), 18)) == 0
                    ? 0
                    : (parseFloat((0, units_1.formatUnits)(usersNewAquaBtcbVaultBalances[index]['2'].toString(), 18)) /
                        parseFloat((0, units_1.formatUnits)(totalSupplyAquabtcb, 18))) *
                        parseFloat((0, units_1.formatUnits)(contractAquaBtcbBalance, 18)))
        ];
    }));
    return res;
}
exports.strategy = strategy;
