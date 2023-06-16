"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'blockzerolabs';
exports.version = '0.1.0';
const abi = [
    'function totalSupply() external view returns (uint256)',
    'function exists(uint256) external view returns (bool)',
    'function ownerOf(uint256) external view returns (address)',
    'function balanceOf(uint256) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Step 1. Retrieve the total supply of Cryptonauts
    const totalSupply = options.totalSupply;
    // Step 2. Determine which ones still exist (i.e not burned)
    const nftExistsMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    for (let _nftId = 0; _nftId < totalSupply; _nftId++) {
        nftExistsMulti.call(_nftId, options._nftTokenAddress, // This is a static address
        'exists', [_nftId]);
    }
    const nftExists = await nftExistsMulti.execute();
    // Step 3. Determine owners for NFTs that still exist
    const nftOwnersMulti = new utils_1.Multicaller(network, provider, abi, { blockTag });
    for (let _nftId = 0; _nftId < totalSupply; _nftId++) {
        // If the NFT exists, get the owner
        if (nftExists[_nftId]) {
            nftOwnersMulti.call(_nftId, options._nftTokenAddress, 'ownerOf', [
                _nftId
            ]);
        }
    }
    const nftOwners = await nftOwnersMulti.execute();
    // Step 4. Get the balance of each NFT from the Vault
    const vaultBalanceMulti = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (let _nftId = 0; _nftId < totalSupply; _nftId++) {
        // If the NFT exists, get the owner
        if (nftExists[_nftId]) {
            vaultBalanceMulti.call(_nftId, options._vaultAddress, 'balanceOf', [
                _nftId
            ]);
        }
    }
    const vaultBalance = await vaultBalanceMulti.execute();
    // Iterate over each address provided
    const balances = {};
    addresses.forEach((address) => {
        let totalBalance = bignumber_1.BigNumber.from(0);
        // Iterate over each NFT
        for (let _nftId = 0; _nftId < totalSupply; _nftId++) {
            // Ensure the NFT Exists before continuing to add balance
            if (nftExists[_nftId]) {
                // Ensure this address is the owner before continuing to add balance
                if (nftOwners[_nftId] == (0, address_1.getAddress)(address)) {
                    // Add the balance
                    totalBalance = totalBalance.add(vaultBalance[_nftId]);
                }
            }
        }
        // Format the balance with 18 decimals (fixed)
        balances[address] = parseFloat((0, units_1.formatUnits)(totalBalance, options.decimals));
    });
    return balances;
}
exports.strategy = strategy;
