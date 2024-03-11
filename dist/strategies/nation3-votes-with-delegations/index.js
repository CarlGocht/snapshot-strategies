"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'nation3';
exports.version = '0.2.0';
const DECIMALS = 18;
const balanceAbi = [
    'function balanceOf(address account) external view returns (uint256)'
];
const ownerAbi = ['function ownerOf(uint256 id) public view returns (address)'];
const signerAbi = [
    'function signerOf(uint256 id) external view  returns (address)'
];
const lastTokenIdAbi = ['function getNextId() external view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const formattedAddressesThatVoted = addresses.map((addr) => (0, address_1.getAddress)(addr));
    const erc721OwnerCaller = new utils_1.Multicaller(network, provider, ownerAbi, {
        blockTag
    });
    const erc721SignerCaller = new utils_1.Multicaller(network, provider, signerAbi, {
        blockTag
    });
    const erc721LastTokenIdCaller = new utils_1.Multicaller(network, provider, lastTokenIdAbi, { blockTag });
    const erc20BalanceCaller = new utils_1.Multicaller(network, provider, balanceAbi, {
        blockTag
    });
    erc721LastTokenIdCaller.call('lastTokenId', options.erc721, 'getNextId');
    const lastIndex = await erc721LastTokenIdCaller.execute();
    const lastTokenId = bignumber_1.BigNumber.from(lastIndex.lastTokenId).toNumber();
    for (let i = 1; i < lastTokenId; i++) {
        erc721SignerCaller.call(i, options.erc721, 'signerOf', [i]);
        erc721OwnerCaller.call(i, options.erc721, 'ownerOf', [i]);
    }
    const [erc721Signers, erc721Owners] = await Promise.all([
        erc721SignerCaller.execute(),
        erc721OwnerCaller.execute()
    ]);
    const erc721OwnersArr = Object.entries(erc721Owners);
    const erc721SignersArr = Object.entries(erc721Signers);
    //There is slightly confusing logic here, but ultimately the
    //resultant Map below Maps the Voting Address to the list of
    //addresses for which they are voting on behalf of. In the
    //majority cases this will be a one to one mapping.
    const votingAddressToOwnerAddressMap = buildPowerMap(formattedAddressesThatVoted, erc721OwnersArr, erc721SignersArr);
    const erc20Balances = await getVEBalancesForAddressMap(votingAddressToOwnerAddressMap, erc20BalanceCaller, options.erc20);
    const agg = formattedAddressesThatVoted.map((addr) => {
        const holderAddresses = votingAddressToOwnerAddressMap.get(addr);
        const total = holderAddresses?.reduce((sum, addr) => {
            return sum.add(erc20Balances[addr] || 0);
        }, bignumber_1.BigNumber.from(0)) || 0;
        return [addr, parseFloat((0, units_1.formatUnits)(total, DECIMALS))];
    });
    const result = Object.fromEntries(agg);
    return result;
}
exports.strategy = strategy;
function buildPowerMap(formattedAddressesThatVoted, erc721OwnersArr, erc721SignersArr) {
    const delegatedTokens = erc721SignersArr.filter(([id, address]) => address !== erc721OwnersArr[id]);
    const votingAddressToOwnerAddressMap = mapOwnersVotingPower(formattedAddressesThatVoted, erc721OwnersArr, delegatedTokens);
    addDelegatedVotingPowerToMap(formattedAddressesThatVoted, erc721OwnersArr, erc721SignersArr, delegatedTokens, votingAddressToOwnerAddressMap);
    return votingAddressToOwnerAddressMap;
}
function mapOwnersVotingPower(formattedAddressesThatVoted, erc721OwnersArr, delegatedTokens) {
    return erc721OwnersArr.reduce((acc, [id, addr]) => {
        if (!formattedAddressesThatVoted.includes(addr)) {
            return acc;
        }
        //If the address that voted is the owner, but the owner has
        //delegated their vote on this passport then they do not
        //get any voting power from this passport.
        if (delegatedTokens.some((delegated) => delegated[0] === id)) {
            return acc;
        }
        acc.set(addr, [addr]);
        return acc;
    }, new Map());
}
function addDelegatedVotingPowerToMap(formattedAddressesThatVoted, erc721OwnersArr, erc721SignersArr, delegatedTokens, mapThatGetsUpdated) {
    erc721SignersArr.reduce((acc, [id, addr]) => {
        if (!formattedAddressesThatVoted.includes(addr)) {
            return acc;
        }
        //This works because the signerOf is defaulted to the ownerOf value
        if (!delegatedTokens.some((delegated) => delegated[0] === id)) {
            return acc;
        }
        if (!mapThatGetsUpdated.has(addr)) {
            acc.set(addr, []);
        }
        acc.get(addr)?.push(erc721OwnersArr[id][1]);
        return acc;
    }, mapThatGetsUpdated);
}
async function getVEBalancesForAddressMap(votingAddressToOwnerAddressMap, erc20BalanceCaller, veNationAddress) {
    votingAddressToOwnerAddressMap.forEach((addresses) => {
        addresses.forEach((address) => {
            erc20BalanceCaller.call(address, veNationAddress, 'balanceOf', [address]);
        });
    });
    const erc20Balances = await erc20BalanceCaller.execute();
    return erc20Balances;
}
