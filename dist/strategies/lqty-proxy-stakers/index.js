"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'majkic99';
exports.version = '0.1.0';
const abiStaking = ['function stakes(address) public view returns (uint256)'];
const abiProxyRegistry = [
    'function proxies(address) public view returns (address)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const proxyMulti = new utils_1.Multicaller(network, provider, abiProxyRegistry, {
        blockTag
    });
    addresses.forEach((address) => proxyMulti.call(address, options.proxyRegistryAddr, 'proxies', [address]));
    const proxyAddresses = await proxyMulti.execute();
    const stakersMulti = new utils_1.Multicaller(network, provider, abiStaking, {
        blockTag
    });
    addresses.forEach((address) => {
        stakersMulti.call(address, options.lqtyStakingAddr, 'stakes', [
            proxyAddresses[address]
        ]);
    });
    const result = await stakersMulti.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, 18))
    ]));
}
exports.strategy = strategy;
