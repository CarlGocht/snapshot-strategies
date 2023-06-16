"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'PencilDad';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('micLP.phoon', options.token, 'balanceOf', [options.micLP]);
    multi.call('micLP.totalSupply', options.micLP, 'totalSupply');
    multi.call('usdtLP.phoon', options.token, 'balanceOf', [options.usdtLP]);
    multi.call('usdtLP.totalSupply', options.usdtLP, 'totalSupply');
    addresses.forEach((address) => {
        multi.call(`balance.${address}`, options.token, 'balanceOf', [address]);
        multi.call(`micLP.${address}.balance`, options.micLP, 'balanceOf', [
            address
        ]);
        multi.call(`micLP.${address}.staked`, options.micRewardPool, 'balanceOf', [
            address
        ]);
        multi.call(`usdtLP.${address}.balance`, options.usdtLP, 'balanceOf', [
            address
        ]);
        multi.call(`usdtLP.${address}.staked`, options.usdtRewardPool, 'balanceOf', [address]);
    });
    const result = await multi.execute();
    const phoonPerMicLP = (0, units_1.parseUnits)(result.micLP.phoon.toString(), 18).div(result.micLP.totalSupply);
    const phoonPerUsdtLP = (0, units_1.parseUnits)(result.usdtLP.phoon.toString(), 18).div(result.usdtLP.totalSupply);
    return Object.fromEntries(Array(addresses.length)
        .fill('')
        .map((_, i) => {
        const micPhoon = result.micLP[addresses[i]].balance
            .add(result.micLP[addresses[i]].staked)
            .mul(phoonPerMicLP)
            .div((0, units_1.parseUnits)('1', 18));
        const usdtPhoon = result.usdtLP[addresses[i]].balance
            .add(result.usdtLP[addresses[i]].staked)
            .mul(phoonPerUsdtLP)
            .div((0, units_1.parseUnits)('1', 18));
        const score = result.balance[addresses[i]].add(micPhoon).add(usdtPhoon);
        return [addresses[i], parseFloat((0, units_1.formatUnits)(score, 18))];
    }));
}
exports.strategy = strategy;
