"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'drgorillamd';
exports.version = '1.0.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
const BUSD = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const WAVAX = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';
const USDC = '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664';
const WAVAXUSDC = '0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const block = await provider.getBlock(blockTag);
    const timestamp = block.timestamp;
    const avaxBlockTag = await getAvaxBlockTag(timestamp, options);
    // BSC balances:
    const multiBsc = new utils_2.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multiBsc.call(address + '-jade', options.JADE.address, 'balanceOf', [
            address
        ]);
        multiBsc.call(address + '-sjade', options.SJADE.address, 'balanceOf', [
            address
        ]);
    });
    // BUSD per JADE spot - pick CAREFULLY the block height, it is NOT a twap
    // as a twap would require 2 additionnal multicalls (and therefore be above the Snapshot 5 calls limit)
    multiBsc.call('jadeLPBalance', options.JADE.address, 'balanceOf', [
        options.JADELP.address
    ]); // jade balance in jade-busd pool
    multiBsc.call('busdLPBalance', BUSD, 'balanceOf', [options.JADELP.address]); // BUSD balance in jade-busd pool
    // Avax balances:
    const multiAvax = new utils_2.Multicaller('43114', (0, utils_2.getProvider)('43114'), abi, {
        blockTag: avaxBlockTag
    });
    addresses.forEach((address) => {
        multiAvax.call(address + '-smrt', options.SMRT.address, 'balanceOf', [
            address
        ]);
        multiAvax.call(address + '-smrtR', options.SMRTR.address, 'balanceOf', [
            address
        ]);
        multiAvax.call(address + '-smrtRLp', options.SMRTRLP.address, 'balanceOf', [
            address
        ]);
    });
    // WAVAX per SMRT spot
    multiAvax.call('smrtLPBalance', options.SMRT.address, 'balanceOf', [
        options.SMRTLP.address
    ]); // SMRT in SMRT/WAVAX pool balance
    multiAvax.call('wavaxSmrtLPBalance', WAVAX, 'balanceOf', [
        options.SMRTLP.address
    ]); // wavax in SMRT/WAVAX pool balance
    // WAVAX per SMRTR spot
    multiAvax.call('smrtRLPBalance', options.SMRTR.address, 'balanceOf', [
        options.SMRTRLP.address
    ]);
    multiAvax.call('wavaxSmrtRLPBalance', WAVAX, 'balanceOf', [
        options.SMRTRLP.address
    ]); // SMRT SMRT/WAVAX pool balance
    // USD per WAVAX spot
    multiAvax.call('UsdLPBalance', USDC, 'balanceOf', [WAVAXUSDC]); // SMRT SMRT/WAVAX pool balance
    multiAvax.call('wavaxUsdLPBalance', WAVAX, 'balanceOf', [WAVAXUSDC]); // SMRT SMRT/WAVAX pool balance
    // Avax SMRTR/WAVAX pool: LP token total supply
    multiAvax.call('smrtRLPSupply', options.SMRTRLP.address, 'totalSupply', []);
    let resBsc = { 0: 0 }, resAvax = [0, 0, 0, { 0: 0 }, { 0: 0 }];
    [resBsc, resAvax] = await Promise.all([
        multiBsc.execute(),
        multiAvax.execute()
    ]);
    // All prices in USDish (BUSD or USDC.e)
    const jadePrice = parseFloat((0, units_1.formatUnits)(resBsc['busdLPBalance'], 18)) /
        parseFloat((0, units_1.formatUnits)(resBsc['jadeLPBalance'], 9));
    const wavaxPrice = parseFloat((0, units_1.formatUnits)(resAvax['UsdLPBalance'], 6)) /
        parseFloat((0, units_1.formatUnits)(resAvax['wavaxUsdLPBalance'], 18));
    const smrtPrice = wavaxPrice /
        (parseFloat((0, units_1.formatUnits)(resAvax['smrtLPBalance'], 18)) /
            parseFloat((0, units_1.formatUnits)(resAvax['wavaxSmrtLPBalance'], 18)));
    const smrtRPrice = wavaxPrice /
        (parseFloat((0, units_1.formatUnits)(resAvax['smrtRLPBalance'], 18)) /
            parseFloat((0, units_1.formatUnits)(resAvax['wavaxSmrtRLPBalance'], 18)));
    const smrtRLPBalance = parseFloat((0, units_1.formatUnits)(resAvax['smrtRLPBalance'], 18));
    const smrtRLPSupply = parseFloat((0, units_1.formatUnits)(resAvax['smrtRLPSupply'], 18));
    return Object.fromEntries(addresses.map((adr) => {
        let bal = parseFloat((0, units_1.formatUnits)(resBsc[adr + '-jade'], options.JADE.decimals));
        bal += parseFloat((0, units_1.formatUnits)(resBsc[adr + '-sjade'], options.SJADE.decimals));
        // SMRT balance * SMRT price/JADE price:
        const parsedSmrt = parseFloat((0, units_1.formatUnits)(resAvax[adr + '-smrt'], options.SMRT.decimals));
        bal += (parsedSmrt * smrtPrice) / jadePrice;
        // SMRTR balance * SMRTR price/JADE price:
        const parsedSrmtr = parseFloat((0, units_1.formatUnits)(resAvax[adr + '-smrtR'], options.SMRTR.decimals));
        bal += (parsedSrmtr * smrtRPrice) / jadePrice;
        // LP token held * smrtr pool balance / LP token total supply:
        const LPHeld = (parseFloat((0, units_1.formatUnits)(resAvax[adr + '-smrtRLp'], 18)) *
            smrtRLPBalance) /
            smrtRLPSupply;
        bal += (LPHeld * smrtRPrice) / jadePrice;
        return [adr, bal];
    }));
}
exports.strategy = strategy;
async function getAvaxBlockTag(timestamp, options) {
    const query = {
        blocks: {
            __args: {
                first: 1,
                orderBy: 'number',
                orderDirection: 'desc',
                where: {
                    timestamp_lte: timestamp
                }
            },
            number: true,
            timestamp: true
        }
    };
    const data = await (0, utils_1.subgraphRequest)(options.avaxGraph, query);
    return Number(data.blocks[0].number);
}
