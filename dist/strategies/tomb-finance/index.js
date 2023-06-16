"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'thecryptoundertaker';
exports.version = '0.1.0';
const MASONRY_ADDRESS = '0x8764DE60236C5843D9faEB1B638fbCE962773B67';
const TSHARE_TOKEN_ADDRESS = '0x4cdF39285D7Ca8eB3f090fDA0C069ba5F4145B37';
const TSHARE_LP_TOKEN_ADDRESS = '0x4733bc45eF91cF7CcEcaeeDb794727075fB209F2';
const CEMETERY_ADDRESS = '0xcc0a87F7e7c693042a9Cc703661F5060c80ACb43';
const abi = [
    'function balanceOf(address) view returns (uint256 amount)',
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)',
    'function totalSupply() view returns (uint256)',
    'function strategy() view returns (address)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    let multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    options.vaultTokens.forEach((token) => {
        multi.call(`vaultStrategies.${token.address}`, token.address, 'strategy');
    });
    const vaultStrategiesResult = await multi.execute();
    multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call(`lp.tshareBalance`, TSHARE_TOKEN_ADDRESS, 'balanceOf', [
        TSHARE_LP_TOKEN_ADDRESS
    ]);
    multi.call(`lp.totalSupply`, TSHARE_LP_TOKEN_ADDRESS, 'totalSupply');
    options.vaultTokens.forEach((token) => {
        multi.call(`vaultTokens.totalSupply.${token.address}`, token.address, 'totalSupply', []);
        multi.call(`vaultTokens.lpBalance.${token.address}`, CEMETERY_ADDRESS, 'userInfo', ['1', vaultStrategiesResult.vaultStrategies[token.address]]);
    });
    addresses.forEach((address) => {
        multi.call(`tshare.${address}`, TSHARE_TOKEN_ADDRESS, 'balanceOf', [
            address
        ]);
        multi.call(`tshareInMasonry.${address}`, MASONRY_ADDRESS, 'balanceOf', [
            address
        ]);
        multi.call(`lpInCemetery.${address}`, CEMETERY_ADDRESS, 'userInfo', [
            '1',
            address
        ]);
        multi.call(`lp.${address}`, TSHARE_LP_TOKEN_ADDRESS, 'balanceOf', [
            address
        ]);
        options.vaultTokens.forEach((token) => {
            multi.call(`vaultTokens.${address}.${token.address}`, token.address, 'balanceOf', [address]);
        });
    });
    const result = await multi.execute();
    return Object.fromEntries(addresses.map((address) => {
        const tshareInWallet = parseFloat((0, units_1.formatUnits)(result.tshare[address], 18));
        const tshareInLpInWallet = parseFloat((0, units_1.formatUnits)(result.lp[address]
            .mul(result.lp.tshareBalance)
            .div(result.lp.totalSupply), 18));
        const tshareInMasonry = parseFloat((0, units_1.formatUnits)(result.tshareInMasonry[address], 18));
        const tshareInCemetery = parseFloat((0, units_1.formatUnits)(result.lpInCemetery[address].amount
            .mul(result.lp.tshareBalance)
            .div(result.lp.totalSupply), 18));
        const tshareInVaults = options.vaultTokens.reduce((previous, token) => previous +
            parseFloat((0, units_1.formatUnits)(result.vaultTokens[address][token.address]
                .mul(result.vaultTokens.lpBalance[token.address].amount)
                .div(result.vaultTokens.totalSupply[token.address])
                .mul(result.lp.tshareBalance)
                .div(result.lp.totalSupply), 18)), 0);
        return [
            address,
            Math.sqrt(tshareInWallet +
                tshareInLpInWallet +
                tshareInMasonry +
                tshareInCemetery +
                tshareInVaults)
        ];
    }));
}
exports.strategy = strategy;
