"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'alfonsocarbono';
exports.version = '1.0.0';
const abi = [
    'function userStakes(address) external view returns(uint256)',
    'function totalUserStake(address) external view returns(uint256)',
    'function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
    'function totalSupply() public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const _formatUnits = (value) => parseFloat((0, units_1.formatUnits)(value, options.decimals));
    const multiLiquidityProvider = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    multiLiquidityProvider.call('reserves', options.liquidityAddress, 'getReserves');
    multiLiquidityProvider.call('totalSupply', options.liquidityAddress, 'totalSupply');
    const multiBalances = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    addresses.forEach((address) => {
        multiBalances.call(address + '-stakedBotto', options.stakingAddress, 'userStakes', [address]);
        multiBalances.call(address + '-stakedLPs', options.miningAddress, 'totalUserStake', [address]);
    });
    const { reserves, totalSupply } = await multiLiquidityProvider.execute();
    const balances = await multiBalances.execute();
    return Object.fromEntries(addresses.map((adr) => {
        const stakedBotto = _formatUnits(balances[adr + '-stakedBotto']);
        const stakedLPsBottos = (_formatUnits(balances[adr + '-stakedLPs']) *
            _formatUnits(reserves['_reserve0'])) /
            _formatUnits(totalSupply);
        return [adr, stakedBotto + stakedLPsBottos];
    }));
}
exports.strategy = strategy;
