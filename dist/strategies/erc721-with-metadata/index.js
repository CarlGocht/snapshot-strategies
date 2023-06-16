"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const snapshot_js_1 = __importDefault(require("@snapshot-labs/snapshot.js"));
exports.author = 'allmysmarts';
exports.version = '0.1.1';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // 1st, get all metadata values from the source
    const metadata = await snapshot_js_1.default.utils.getJSON(options.metadataSrc);
    // 2nd, get the balance of the token
    const callWalletToBalanceOf = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToBalanceOf.call(walletAddress, options.address, 'balanceOf', [
            walletAddress
        ]);
    }
    const walletToBalanceOf = await callWalletToBalanceOf.execute();
    // 3rd, get tokenIds for each address, and index
    const callWalletIdToTokenID = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, count] of Object.entries(walletToBalanceOf)) {
        if (count.toNumber() > 0) {
            for (let index = 0; index < count.toNumber(); index++) {
                callWalletIdToTokenID.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
            }
        }
    }
    const walletIdToTokenID = await callWalletIdToTokenID.execute();
    // 4th, sum up metadata value for each address
    const walletToAttributeValue = {};
    for (const [walletId, tokenID] of Object.entries(walletIdToTokenID)) {
        const walletAddress = walletId.split('-')[0];
        const tokenData = metadata.find((x) => x[tokenID.toString()] > 0);
        if (!tokenData)
            continue;
        walletToAttributeValue[walletAddress] =
            (walletToAttributeValue[walletAddress] || 0) +
                tokenData[tokenID.toString()];
    }
    return Object.fromEntries(Object.entries(walletToAttributeValue).map(([address, value]) => [
        address,
        value
    ]));
}
exports.strategy = strategy;
