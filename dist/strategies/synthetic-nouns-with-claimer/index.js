"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const address_1 = require("@ethersproject/address");
exports.author = 'stephancill';
exports.version = '0.1.0';
const abi = ['function ownerOf(uint256 index) external view returns (address)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const checksummedAddresses = addresses.map((address) => (0, address_1.getAddress)(address));
    // Get the minter from zora api
    const mints = await (0, cross_fetch_1.default)('https://api.zora.co/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `{
          mints(where: {collectionAddresses: "${options.address}", minterAddresses: ${JSON.stringify(addresses)}}, pagination: {limit: 500}) {
            nodes {
              mint {
                tokenId,
                toAddress
              }
            }
          }
        }`
        })
    }).then((res) => res.json());
    const mintsByAddress = mints.data.mints.nodes.reduce((acc, node) => {
        const address = (0, address_1.getAddress)(node.mint.toAddress);
        const tokenId = node.mint.tokenId;
        if (!acc[address]) {
            acc[address] = undefined;
        }
        acc[address] = tokenId;
        return acc;
    }, {});
    // Use multicall to check if the token is owned by the address
    const multicaller = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    checksummedAddresses.forEach((address) => {
        if (mintsByAddress[address]) {
            multicaller.call(address, options.address, 'ownerOf', [
                mintsByAddress[address]
            ]);
        }
    });
    const response = await multicaller.execute();
    const scores = Object.fromEntries(checksummedAddresses.map((address) => [
        address,
        response[address] && (0, address_1.getAddress)(response[address]) === address ? 1 : 0
    ]));
    return scores;
}
exports.strategy = strategy;
