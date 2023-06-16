"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'bark4mark';
exports.version = '0.1.0';
const MAX_CONTRACTS = 8;
var ContractType;
(function (ContractType) {
    ContractType["NFT"] = "NFT";
    ContractType["TokenInfusedNFT"] = "TokenInfusedNFT";
})(ContractType || (ContractType = {}));
const abis = {
    NFT: [
        'function balanceOf(address owner) external view returns (uint256 balance)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)',
        'function futures(uint256 index) external view returns (uint256 amount, address token, uint256 unlockDate)',
        'function token() external view returns (address token)'
    ],
    TokenInfusedNFT: [
        'function futures(uint256 index) external view returns (uint256 amount, uint256 unlockDate)'
    ]
};
const compareAddresses = (address1, address2) => {
    if (!address1 || !address2)
        return false;
    return address1.toLowerCase() === address2.toLowerCase();
};
const getMonthDifference = (start, end) => {
    return (end.getMonth() -
        start.getMonth() +
        12 * (end.getFullYear() - start.getFullYear()));
};
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const contractDetails = options.contracts;
    if (contractDetails.length > MAX_CONTRACTS) {
        throw new Error(`Max number (${MAX_CONTRACTS}) of contracts exceeded`);
    }
    const balanceOfMulti = new utils_1.Multicaller(network, provider, abis.NFT, {
        blockTag
    });
    contractDetails.forEach((contractDetail) => {
        addresses.forEach((address) => {
            balanceOfMulti.call(`${contractDetail.address}/${address}`, contractDetail.address, 'balanceOf', [address]);
        });
        if (contractDetail.contractType === ContractType.TokenInfusedNFT) {
            balanceOfMulti.call(`${contractDetail.address}/token`, contractDetail.address, 'token');
        }
    });
    const balanceOfResult = await balanceOfMulti.execute();
    const nftHolderMulti = new utils_1.Multicaller(network, provider, abis.NFT, {
        blockTag
    });
    contractDetails.forEach((contractDetail) => {
        addresses.forEach((address) => {
            const balance = balanceOfResult[`${contractDetail.address}/${address}`];
            for (let index = 0; index < balance; index++) {
                nftHolderMulti.call(`${contractDetail.contractType}/${contractDetail.address}/${address}/${index}`, contractDetail.address, 'tokenOfOwnerByIndex', [address, index]);
            }
        });
    });
    const nftHolders = await nftHolderMulti.execute();
    const nftDealsMulti = new utils_1.Multicaller(network, provider, abis.NFT, {
        blockTag
    });
    const tiNFTDealsMulti = new utils_1.Multicaller(network, provider, abis.TokenInfusedNFT, { blockTag });
    for (const [path, nftId] of Object.entries(nftHolders)) {
        const [contractType, contractAddress, address] = path.split('/');
        switch (contractType) {
            case ContractType.NFT:
                nftDealsMulti.call(`${contractAddress}/${address}`, contractAddress, 'futures', [nftId]);
                break;
            case ContractType.TokenInfusedNFT:
                tiNFTDealsMulti.call(`${contractAddress}/${address}`, contractAddress, 'futures', [nftId]);
                break;
        }
    }
    const nftDeals = await nftDealsMulti.execute();
    const tiNFTDeals = await tiNFTDealsMulti.execute();
    const votes = {};
    for (const [path, deal] of Object.entries(nftDeals)) {
        const [contractAddress, address] = path.split('/');
        const contractDetail = contractDetails.find((element) => element.address === contractAddress);
        if (!contractDetail)
            continue;
        if (!compareAddresses(deal.token, contractDetail.token))
            continue;
        const amount = bignumber_1.BigNumber.from(deal.amount).div(bignumber_1.BigNumber.from(10).pow(contractDetail.decimal));
        let score = amount.toNumber();
        score = score * contractDetail.lockedTokenMultiplier;
        const durationStart = new Date();
        const unlockDate = new Date(deal.unlockDate * 1000);
        const months = getMonthDifference(durationStart, unlockDate);
        let monthlyMultiplier = contractDetail.lockedTokenMonthlyMultiplier[months];
        if (!monthlyMultiplier)
            monthlyMultiplier =
                contractDetail.lockedTokenMonthlyMultiplier['default'];
        score = score * monthlyMultiplier;
        let existingAmount = votes[address];
        if (existingAmount) {
            existingAmount = existingAmount + score;
        }
        else {
            votes[address] = score;
        }
    }
    for (const [path, deal] of Object.entries(tiNFTDeals)) {
        const [contractAddress, address] = path.split('/');
        const contractDetail = contractDetails.find((element) => element.address === contractAddress);
        if (!contractDetail)
            continue;
        const contractToken = balanceOfResult[`${contractDetail.address}/token`];
        if (!compareAddresses(contractToken, contractDetail.token))
            continue;
        const amount = bignumber_1.BigNumber.from(deal.amount).div(bignumber_1.BigNumber.from(10).pow(contractDetail.decimal));
        let score = amount.toNumber();
        score = score * contractDetail.lockedTokenMultiplier;
        const durationStart = new Date();
        const unlockDate = new Date(deal.unlockDate * 1000);
        const months = getMonthDifference(durationStart, unlockDate);
        if (months > 1) {
            let monthlyMultiplier = contractDetail.lockedTokenMonthlyMultiplier[months];
            if (!monthlyMultiplier)
                monthlyMultiplier =
                    contractDetail.lockedTokenMonthlyMultiplier['default'];
            score = score * monthlyMultiplier;
        }
        let existingAmount = votes[address];
        if (existingAmount) {
            existingAmount = existingAmount + score;
        }
        else {
            votes[address] = score;
        }
    }
    return votes;
}
exports.strategy = strategy;
