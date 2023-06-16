"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'paraswap';
exports.version = '0.1.0';
const abi = [
    'function stakeCount(address stakerAddr) view returns (uint256)',
    'function stakeLists(address stakerAddr, uint256 stakeid) view returns (uint128,uint128,uint40,uint16,uint16,uint16)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakeCountByWallet = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.smartcontract,
        'stakeCount',
        [address.toLowerCase()]
    ]), { blockTag });
    const stakeAmountByWallet = [];
    // preparing second array for multicall
    const arrayForMultiCall = [];
    for (const i in stakeCountByWallet) {
        const num = Number(stakeCountByWallet[i] + '');
        stakeAmountByWallet.push({ wallet: addresses[i], amt: bignumber_1.BigNumber.from(0) });
        if (num > 0) {
            const arr = Array.from(Array(num).keys());
            for (const j in arr) {
                arrayForMultiCall.push({
                    wallet: addresses[i].toLowerCase(),
                    stakeId: arr[j]
                });
            }
        }
    }
    const stakeAmountByStakeId = await (0, utils_1.multicall)(network, provider, abi, arrayForMultiCall.map((r) => [
        options.smartcontract,
        'stakeLists',
        [r.wallet, r.stakeId]
    ]), { blockTag });
    for (const i in arrayForMultiCall) {
        for (const j in stakeAmountByWallet) {
            if (arrayForMultiCall[i].wallet.toLowerCase() ===
                stakeAmountByWallet[j].wallet.toLowerCase()) {
                stakeAmountByWallet[j].amt = stakeAmountByWallet[j].amt.add(stakeAmountByStakeId[i][0]);
            }
        }
    }
    return Object.fromEntries(stakeAmountByWallet.map((info, i) => {
        return [
            stakeAmountByWallet[i].wallet,
            parseFloat((0, units_1.formatUnits)(stakeAmountByWallet[i].amt.toString(), 18))
        ];
    }));
}
exports.strategy = strategy;
