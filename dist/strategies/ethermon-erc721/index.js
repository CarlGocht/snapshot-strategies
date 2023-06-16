"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../../utils");
exports.author = 'syedMohib44';
exports.version = '0.0.2';
const abi1 = [
    'function getMonsterObj(uint64 _objId) external view returns(uint64 objId, uint32 classId, address trainer, uint32 exp, uint32 createIndex, uint32 lastClaimIndex, uint createTime)',
    'function balanceOf(address owner) external view returns (uint256 balance)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi1, { blockTag });
    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    addresses.map((address) => {
        multi.call(address, options.EMONA_ADDRESS, 'balanceOf', [address]);
    });
    const player_addresses = await multi.execute();
    const multi1 = new utils_1.Multicaller(network, provider, abi1, { blockTag });
    Object.entries(player_addresses).forEach((address) => {
        const balance = clamp(+player_addresses[address[0]].toString(), 0, 200);
        for (let i = 0; i < balance; i++) {
            multi1.call(address[0].toString() + '-' + i.toString(), options.EMONA_ADDRESS, 'tokenOfOwnerByIndex', [address[0], i]);
        }
    });
    const address_tokens = await multi1.execute();
    const multi2 = new utils_1.Multicaller(network, provider, abi1, { blockTag });
    Object.entries(address_tokens).forEach((address_token) => {
        const address = address_token[0].split('-')[0].toString();
        const token = +address_token[1].toString();
        multi2.call(address + '-' + token, options.EMON_DATA_ADDRESS, 'getMonsterObj', [token]);
    });
    const monObject = await multi2.execute();
    const response = await (0, cross_fetch_1.default)('https://storageapi.fleek.co/' + options.tokenWeightIPFS, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const classIdWeight = await response.json();
    const result = {};
    for (const [_address, _obj] of Object.entries(monObject)) {
        const address = _address.split('-')[0];
        const classId = _obj[1];
        if (!result[address]) {
            result[address] = classIdWeight[classId]
                ? classIdWeight[classId].weight
                : 1;
            continue;
        }
        result[address] += Number(+player_addresses[address].toString() > 200
            ? Number(classIdWeight[classId]
                ? (classIdWeight[classId].weight / 200) *
                    Number(player_addresses[address])
                : 0).toFixed(0)
            : classIdWeight[classId]
                ? classIdWeight[classId].weight
                : 0);
    }
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [address, balance]));
}
exports.strategy = strategy;
