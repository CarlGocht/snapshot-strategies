"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'colony';
exports.version = '0.1';
const colonyAbi = [
    'function getDomain(uint256 domainId) external view returns (uint256, uint256)',
    'function getToken() external view returns (address)'
];
const colonyNetworkAbi = [
    'function getReputationRootHash() external view returns (bytes32)'
];
const tokenAbi = ['function decimals() external view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const rootHashAtBlock = await (0, utils_1.call)(provider, colonyNetworkAbi, [options.colonyNetworkAddress, 'getReputationRootHash', []], { blockTag });
    const domain = await (0, utils_1.call)(provider, colonyAbi, [options.colonyAddress, 'getDomain', [options.domainId]], { blockTag });
    const tokenAddress = await (0, utils_1.call)(provider, colonyAbi, [options.colonyAddress, 'getToken', []], { blockTag });
    const decimals = await (0, utils_1.call)(provider, tokenAbi, [tokenAddress, 'decimals', []], { blockTag });
    const url = `https://xdai.colony.io/reputation/xdai/${rootHashAtBlock}/${options.colonyAddress}/${domain[0]}`;
    const res = await (0, cross_fetch_1.default)(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const data = await res.json();
    const retVal = {};
    addresses.forEach(function (address) {
        const loc = data.addresses.indexOf(address.toLowerCase());
        if (loc > -1) {
            retVal[address] = parseFloat((0, units_1.formatUnits)(data.reputations[loc], decimals));
        }
        else {
            retVal[address] = 0;
        }
    });
    return retVal;
}
exports.strategy = strategy;
