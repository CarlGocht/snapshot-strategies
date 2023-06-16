"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'daniyalmanzoor';
exports.version = '0.1.0';
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const params = {
        vaults: {
            __args: {
                where: {
                    id: options.vaultAddress.toLowerCase()
                }
            },
            totalLockedToken0: true
        }
    };
    const { vaults } = await (0, utils_1.subgraphRequest)(options.unipilotSubgraphURI, params);
    const _totalLP = await (0, utils_1.call)(provider, options.unipilotVaultMethodABI, [options.vaultAddress, 'totalSupply']);
    /**
     * Unipilot pilot vault balance
     */
    const userVaultLP = await (0, utils_1.multicall)(network, provider, options.unipilotVaultMethodABI, addresses.map((_address) => [
        options.vaultAddress,
        'balanceOf',
        [_address]
    ]), { blockTag });
    /**
     * Unipilot Farming pilot balance
     */
    const userFarmingVaultLP = await (0, utils_1.multicall)(network, provider, options.unipilotFarmingMethodABI, addresses.map((_address) => [
        options.unipilotFarming,
        'userInfo',
        [options.vaultAddress, _address]
    ]), { blockTag });
    return Object.fromEntries(addresses.map((_address, i) => {
        const _userShare = bn(userVaultLP[i])
            .add(bn(userFarmingVaultLP[i].lpLiquidity))
            .mul(bn(10 ** 18))
            .div(_totalLP);
        const _userBalance = (0, units_1.formatUnits)(bn(_userShare).mul(bn(vaults[0].totalLockedToken0)).div(bn(10).pow(18)), options.decimals);
        return [_address, parseFloat(_userBalance)];
    }));
}
exports.strategy = strategy;
