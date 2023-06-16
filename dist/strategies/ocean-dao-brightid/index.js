"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const delegation_1 = require("../../utils/delegation");
exports.author = 'trizin';
exports.version = '0.2.0';
const abi = [
    'function isVerifiedUser(address _user) external view returns (bool)'
];
/* Code from multichain strategy */
async function getBlocks(snapshot, provider, options, network) {
    const blocks = {};
    Object.keys(options.strategies).forEach((s) => (blocks[s] = 'latest'));
    const block = await provider.getBlock(snapshot);
    const query = {
        blocks: {
            __args: {
                where: {
                    ts: block.timestamp,
                    network_in: Object.keys(blocks)
                }
            },
            network: true,
            number: true
        }
    };
    const url = 'https://blockfinder.snapshot.org';
    const data = await (0, utils_1.subgraphRequest)(url, query);
    data.blocks.forEach((block) => (blocks[block.network] = block.number));
    data.blocks[network] = snapshot;
    return blocks;
}
////////////////////////////////////////////////////////////////////////////////
async function strategy(space, network, provider, addresses, options, snapshot) {
    const chainBlocks = await getBlocks(snapshot, provider, options, network);
    const delegatitonSpace = options.delegationSpace || space;
    const delegations = await (0, delegation_1.getDelegations)(delegatitonSpace, network, addresses, snapshot);
    const brightIdNetwork = options.brightIdNetwork || network;
    const response = await (0, utils_1.multicall)(brightIdNetwork, (0, utils_1.getProvider)(brightIdNetwork), abi, addresses.map((address) => [
        options.registry,
        'isVerifiedUser',
        [address]
    ]), { blockTag: chainBlocks[brightIdNetwork] });
    const totalScores = {};
    const delegatorAddresses = Object.values(delegations).reduce((a, b) => a.concat(b));
    // remove duplicates
    const allAddresses = addresses
        .concat(delegatorAddresses)
        .filter((address, index, self) => self.indexOf(address) === index); // Remove duplicates
    for (const chain of Object.keys(options.strategies)) {
        let scores = await (0, utils_1.getScoresDirect)(space, options.strategies[chain], chain, (0, utils_1.getProvider)(chain), allAddresses, chainBlocks[chain]);
        // [{ address: '0x...', score: 0.5 },{ address: '0x...', score: 0.5 }]
        // sum scores for each address and return
        scores = scores.reduce((finalScores, score) => {
            for (const [address, value] of Object.entries(score)) {
                if (!finalScores[address]) {
                    finalScores[address] = 0;
                }
                finalScores[address] += value;
            }
            return finalScores;
        }, {});
        // { address: '0x...55', score: 1.0 }
        // sum delegations
        addresses.forEach((address) => {
            if (!scores[address])
                scores[address] = 0;
            if (delegations[address]) {
                delegations[address].forEach((delegator) => {
                    scores[address] += scores[delegator] ?? 0; // add delegator score
                    scores[delegator] = 0; // set delegator score to 0
                });
            }
        });
        for (const key of Object.keys(scores)) {
            totalScores[key] = totalScores[key]
                ? totalScores[key] + scores[key]
                : scores[key];
        }
    }
    return Object.fromEntries(addresses.map((address, index) => {
        let addressScore = totalScores[address];
        addressScore *= response[index][0]
            ? options.brightIdMultiplier // brightId multiplier
            : options.notVerifiedMultiplier; // not verified multiplier
        return [address, addressScore];
    }));
}
exports.strategy = strategy;
