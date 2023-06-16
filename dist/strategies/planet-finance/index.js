"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'planet-finance';
exports.version = '0.0.1';
const planetFinanceFarmAbi = [
    'function poolInfo(uint256) returns (address want,uint256 allocPoint,uint256 lastRewardBlock,uint256 accAQUAPerShare,address strat)',
    'function stakedWantTokens(uint256 _pid, address _user) returns (uint256)'
];
const bep20Abi = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)'
];
const aquaAutoCompAbi = [
    'function balanceOf() view returns (uint256)',
    'function totalShares() view returns (uint256)',
    'function userInfo(address) view returns (uint256 shares, uint256 lastDepositedTime , uint256 cakeAtLastUserAction , uint256 lastUserActionTime)'
];
const aquaLendingAbi = [
    'function getAccountSnapshot(address) view returns (uint256,uint256,uint256,uint256)'
];
const planetFinanceFarmContractAddress = '0x0ac58Fd25f334975b1B61732CF79564b6200A933';
const gammaFarmAddress = '0xB87F7016585510505478D1d160BDf76c1f41b53d';
const aquaAutoCompPoolAddress = '0x8A53dAdF2564d030b41dB1c04fB3c4998dC1326e';
const aquaAddress = '0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991';
const aquaBnbLpTokenAddress = '0x03028D2F8B275695A1c6AFB69A4765e3666e36d9';
const aquaGammaLpTokenAddress = '0xcCaF3fcE9f2D7A7031e049EcC65c0C0Cc331EE0D';
const aquaLendingAddress = '0xb7eD4A5AF620B52022fb26035C565277035d4FD7';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const erc20Multi = new utils_2.Multicaller(network, provider, bep20Abi, {
        blockTag
    });
    const autoCompMulti = new utils_2.Multicaller(network, provider, aquaAutoCompAbi, {
        blockTag
    });
    // returns user's aqua balance ofr their address
    let score = (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    // returns user's aqua balance in aqua only vault
    let usersAquaVaultBalances = (0, utils_1.multicall)(network, provider, planetFinanceFarmAbi, addresses.map((address) => [
        planetFinanceFarmContractAddress,
        'stakedWantTokens',
        ['1', address]
    ]), { blockTag });
    //returns user's shares  in aqua auto comp vault
    let usersAquaAutoCompVaultBalances = (0, utils_1.multicall)(network, provider, aquaAutoCompAbi, addresses.map((address) => [
        aquaAutoCompPoolAddress,
        'userInfo',
        [address]
    ]), { blockTag });
    // returns user's aqua balance in aqua-bnb vault
    let usersAquaGammaVaultBalances = (0, utils_1.multicall)(network, provider, planetFinanceFarmAbi, addresses.map((address) => [
        gammaFarmAddress,
        'stakedWantTokens',
        ['0', address]
    ]), { blockTag });
    // returns user's aqua balance in aqua-bnb vault
    let usersNewAquaBnbVaultBalances = (0, utils_1.multicall)(network, provider, planetFinanceFarmAbi, addresses.map((address) => [
        gammaFarmAddress,
        'stakedWantTokens',
        ['1', address]
    ]), { blockTag });
    //AQUA LENDING
    let usersAquaInLending = (0, utils_1.multicall)(network, provider, aquaLendingAbi, addresses.map((address) => [
        aquaLendingAddress,
        'getAccountSnapshot',
        [address]
    ]), { blockTag });
    const result = await Promise.all([
        score,
        usersAquaVaultBalances,
        usersAquaAutoCompVaultBalances,
        usersAquaGammaVaultBalances,
        usersNewAquaBnbVaultBalances,
        usersAquaInLending
    ]);
    score = result[0];
    usersAquaVaultBalances = result[1];
    usersAquaAutoCompVaultBalances = result[2];
    usersAquaGammaVaultBalances = result[3];
    usersNewAquaBnbVaultBalances = result[4];
    usersAquaInLending = result[5];
    //AQUA-BNB
    erc20Multi.call('aquaBnbTotalSupply', aquaBnbLpTokenAddress, 'totalSupply');
    erc20Multi.call('aquaBnbAquaBal', aquaAddress, 'balanceOf', [
        aquaBnbLpTokenAddress
    ]);
    //AQUA-GAMMA
    erc20Multi.call('aquaGammaTotalSupply', aquaGammaLpTokenAddress, 'totalSupply');
    erc20Multi.call('aquaGammaAquaBal', aquaAddress, 'balanceOf', [
        aquaGammaLpTokenAddress
    ]);
    const erc20Result = await erc20Multi.execute();
    const totalSupply = erc20Result.aquaBnbTotalSupply.toString();
    const contractAquaBalance = erc20Result.aquaBnbAquaBal.toString();
    const totalSupplyAquaGamma = erc20Result.aquaGammaTotalSupply.toString();
    const aquaGammaContractAquaBalance = erc20Result.aquaGammaAquaBal.toString();
    //AQUA AUTO COMPOUNDING
    autoCompMulti.call('aquaBalance', aquaAutoCompPoolAddress, 'balanceOf');
    autoCompMulti.call('totalShares', aquaAutoCompPoolAddress, 'totalShares');
    const autoCompResult = await autoCompMulti.execute();
    let aquaBalance = autoCompResult.aquaBalance.toString();
    aquaBalance = parseFloat((0, units_1.formatUnits)(aquaBalance, 18));
    let totalShares = autoCompResult.totalShares.toString();
    totalShares = parseFloat((0, units_1.formatUnits)(totalShares, 18));
    return Object.fromEntries(Object.entries(score).map((address, index) => [
        address[0],
        address[1] +
            parseFloat((0, units_1.formatUnits)(usersAquaVaultBalances[index].toString(), 18)) +
            (parseFloat((0, units_1.formatUnits)(usersNewAquaBnbVaultBalances[index].toString(), 18)) /
                parseFloat((0, units_1.formatUnits)(totalSupply, 18))) *
                parseFloat((0, units_1.formatUnits)(contractAquaBalance, 18)) +
            (parseFloat((0, units_1.formatUnits)(usersAquaGammaVaultBalances[index].toString(), 18)) /
                parseFloat((0, units_1.formatUnits)(totalSupplyAquaGamma, 18))) *
                parseFloat((0, units_1.formatUnits)(aquaGammaContractAquaBalance, 18)) +
            (parseFloat((0, units_1.formatUnits)(usersAquaAutoCompVaultBalances[index]['shares'].toString(), 18)) /
                totalShares) *
                aquaBalance +
            parseFloat((0, units_1.formatUnits)(usersAquaInLending[index]['1'], 18)) *
                parseFloat((0, units_1.formatUnits)(usersAquaInLending[index]['3'], 18))
    ]));
}
exports.strategy = strategy;
