"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'arr00';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'borrowBalanceStored',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const oldBlockTag = typeof snapshot === 'number'
        ? snapshot - options.offsetCheck
        : (await provider.getBlockNumber()) - options.offsetCheck;
    const balanceOfCalls = addresses.map((address) => [
        options.address,
        'balanceOf',
        [address]
    ]);
    const borrowBalanceCalls = addresses.map((address) => [
        options.address,
        'borrowBalanceStored',
        [address]
    ]);
    const calls = balanceOfCalls.concat(borrowBalanceCalls);
    const [response, balancesOldResponse] = await Promise.all([
        (0, utils_1.multicall)(network, provider, abi, calls, { blockTag }),
        (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
            options.address,
            'balanceOf',
            [address]
        ]), { blockTag: oldBlockTag })
    ]);
    const balancesNowResponse = response.slice(0, addresses.length);
    const borrowsNowResponse = response.slice(addresses.length);
    const resultData = {};
    for (let i = 0; i < balancesNowResponse.length; i++) {
        let noBorrow = 1;
        if (options.borrowingRestricted) {
            noBorrow =
                borrowsNowResponse[i].toString().localeCompare('0') == 0 ? 1 : 0;
        }
        const balanceNow = parseFloat((0, units_1.formatUnits)(balancesNowResponse[i].toString(), options.decimals));
        const balanceOld = parseFloat((0, units_1.formatUnits)(balancesOldResponse[i].toString(), options.decimals));
        resultData[addresses[i]] = Math.min(balanceNow, balanceOld) * noBorrow;
    }
    return resultData;
}
exports.strategy = strategy;
