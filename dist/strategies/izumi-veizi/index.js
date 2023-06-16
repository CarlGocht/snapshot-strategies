"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'izumiFinance';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function nftVeiZiAt(uint256 nftId, uint256 timestamp) external view returns (uint256)',
    'function stakedNft(address) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const block = await provider.getBlock(snapshot);
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const timeStamp = block.timestamp;
    const ans = {};
    const nftBalance = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => nftBalance.call(address, options.address, 'balanceOf', [address]));
    const balance = await nftBalance.execute();
    const nftIdCall = new utils_1.Multicaller(network, provider, abi, { blockTag });
    Object.entries(balance).map(async ([address, balance]) => {
        const num = Number(balance.toString());
        for (let i = 0; i < num; i++) {
            const path = address + '-' + i;
            nftIdCall.call(path, options.address, 'tokenOfOwnerByIndex', [
                address,
                i
            ]);
        }
    });
    const stakingCheck = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        const stakedPath = address + '-' + 'staked';
        stakingCheck.call(stakedPath, options.address, 'stakedNft', [address]);
    });
    const ids = await nftIdCall.execute();
    const stakedIds = await stakingCheck.execute();
    Object.assign(ids, stakedIds);
    const pointCall = new utils_1.Multicaller(network, provider, abi, { blockTag });
    Object.entries(ids).map(([path, id]) => {
        pointCall.call(path, options.address, 'nftVeiZiAt', [id, timeStamp]);
    });
    const points = await pointCall.execute();
    Object.entries(points).map(([path, point]) => {
        const owner = path.split('-')[0];
        const tmp = Object.keys(ans).find((t) => {
            return t === owner;
        });
        const decimalPoint = Number(Math.floor(parseFloat((0, units_1.formatUnits)(point, options.decimals)) * 100) / 100);
        if (tmp !== undefined) {
            ans[owner] = Number(ans[owner]) + decimalPoint;
        }
        else {
            Object.assign(ans, { [owner]: decimalPoint });
        }
    });
    return Object.fromEntries(Object.entries(ans).map(([address, point]) => [
        address,
        Math.floor(point / 10) * 10
    ]));
}
exports.strategy = strategy;
