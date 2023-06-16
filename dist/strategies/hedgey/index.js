"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'Hedgey';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner) external view returns (uint256 balance)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)',
    'function futures(uint256 index) external view returns (uint256 amount, address token, uint256 unlockDate)'
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const balanceOfMulti = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    addresses.forEach((address) => {
        balanceOfMulti.call(address, options.contractAddress, 'balanceOf', [
            address
        ]);
    });
    const balanceOfResult = await balanceOfMulti.execute();
    const nftHolderMulti = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [address, balance] of Object.entries(balanceOfResult)) {
        for (let index = 0; index < balance; index++) {
            nftHolderMulti.call(`${address}-${index}`, options.contractAddress, 'tokenOfOwnerByIndex', [address, String(index)]);
        }
    }
    const nftHolders = await nftHolderMulti.execute();
    const dealsMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    for (const [address, nftId] of Object.entries(nftHolders)) {
        dealsMulti.call(address, options.contractAddress, 'futures', [nftId]);
    }
    const ownerToDeal = await dealsMulti.execute();
    const votes = {};
    for (const [index, deal] of Object.entries(ownerToDeal)) {
        const address = index.split('-')[0];
        if (!votes[address]) {
            votes[address] = bignumber_1.BigNumber.from(0);
        }
        if (deal.token.toLowerCase() === options.token.toLowerCase()) {
            votes[address] = votes[address].add(deal.amount);
        }
    }
    const result = [];
    Object.keys(votes).forEach((address) => {
        const score = votes[address].div(bignumber_1.BigNumber.from(10).pow(options.decimals));
        result[address] = score.toNumber();
    });
    return result;
}
exports.strategy = strategy;
