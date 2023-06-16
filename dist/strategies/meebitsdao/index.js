"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'peters-josh';
exports.version = '0.1.0';
const abi = [
    'function ownerOf(uint256 tokenId) public view returns (address owner)',
    'function tokenURI(uint256 tokenId) public view returns (string uri)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const uriCalls = [];
    for (let i = options.startingTokenId; i <= options.endingTokenId; i++) {
        uriCalls.push([options.address, 'tokenURI', [i]]);
    }
    const ownerCalls = [];
    for (let i = options.startingTokenId; i <= options.endingTokenId; i++) {
        ownerCalls.push([options.address, 'ownerOf', [i]]);
    }
    const ownerResponse = await (0, utils_1.multicall)(network, provider, abi, ownerCalls, {
        blockTag
    });
    const resp = await (0, cross_fetch_1.default)(options.apiUrl);
    const tokenStatus = await resp.json();
    function checkActivated(address) {
        const index = ownerResponse.findIndex((res) => res.owner.toLowerCase() === address.toLowerCase());
        if (index == -1) {
            return 0;
        }
        if (tokenStatus[index].Active == true) {
            return 1;
        }
        return 0;
    }
    const votes = addresses.map((address) => checkActivated(address));
    const scores = {};
    votes.map((value, i) => {
        scores[addresses[i]] = value;
    });
    return scores;
}
exports.strategy = strategy;
