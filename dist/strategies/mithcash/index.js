"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'jeremyHD';
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
    const response = await (0, utils_1.multicall)(network, provider, abi, [
        [options.token, 'balanceOf', [options.sushiswap]],
        [options.sushiswap, 'totalSupply'],
        ...addresses.map((address) => [
            options.sushiswap,
            'balanceOf',
            [address]
        ]),
        ...addresses.map((address) => [
            options.sharePool,
            'balanceOf',
            [address]
        ]),
        ...addresses.map((address) => [
            options.token,
            'balanceOf',
            [address]
        ]),
        ...addresses.map((address) => [
            options.boardroom,
            'balanceOf',
            [address]
        ])
    ], { blockTag });
    const misPerLP = (0, units_1.parseUnits)(response[0][0].toString(), 18).div(response[1][0]);
    const lpBalances = response.slice(2, addresses.length + 2);
    const stakedLpBalances = response.slice(addresses.length + 2, addresses.length * 2 + 2);
    const tokenBalances = response.slice(addresses.length * 2 + 2, addresses.length * 3 + 2);
    const boardroomBalances = response.slice(addresses.length * 3 + 2, addresses.length * 4 + 2);
    return Object.fromEntries(Array(addresses.length)
        .fill('')
        .map((_, i) => {
        const lpBalance = lpBalances[i][0].add(stakedLpBalances[i][0]);
        const misLpBalance = lpBalance.mul(misPerLP).div((0, units_1.parseUnits)('1', 18));
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(misLpBalance
                .add(tokenBalances[i][0])
                .add(boardroomBalances[i][0]), options.decimals))
        ];
    }));
}
exports.strategy = strategy;
