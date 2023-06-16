"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'onigiri-x';
exports.version = '0.1.0';
const abi = [
    'function getReserves() external view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const pairAddresses = [
        '0x7ecb3be21714114d912469810aedd34e6fc27736',
        '0x3203bf44d434452b4605c7657c51bfeaf2a0847c'
    ];
    const priceResponse = await (0, utils_1.multicall)(network, provider, abi, pairAddresses.map((address) => [address, 'getReserves', []]), { blockTag });
    const priceDecoToEth = parseFloat(priceResponse[0]._reserve1) /
        parseFloat(priceResponse[0]._reserve0);
    const priceEthToMona = parseFloat(priceResponse[1]._reserve0) /
        parseFloat(priceResponse[1]._reserve1);
    const erc20Balances = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(addresses.map((address) => [
        address,
        erc20Balances[address] * priceDecoToEth * priceEthToMona
    ]));
}
exports.strategy = strategy;
