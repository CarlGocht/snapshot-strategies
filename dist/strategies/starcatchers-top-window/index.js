"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'sunshinekitty';
exports.version = '0.0.1';
const SC_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sunshinekitty/starcatchers-ia1';
async function strategy(space, network, provider, addresses, options, snapshot) {
    if (!options.origin) {
        options.origin = 14277684; // Block at 2/25/22 2:22pm PT (DST)
    }
    if (!options.delegateLimit) {
        options.delegateLimit = 35;
    }
    if (!options.delegateDuration) {
        const bpd = 6500; // Estimated blocks produced per day.
        options.delegateDuration = 14 * bpd; // 2w
    }
    // Based on snapshot or current block height, calculates delegate cycles that
    // have passed, then determines block height for current delegate cycle.
    const blockNumber = typeof snapshot === 'number' ? snapshot : await provider.getBlockNumber();
    const cyclesPassed = ((blockNumber - Number(options.origin)) /
        Number(options.delegateDuration)) |
        0;
    const voteBlock = Number(options.origin) + cyclesPassed * Number(options.delegateDuration);
    const query = {
        voteWeights: {
            __args: {
                first: Number(options.delegateLimit),
                orderBy: 'weight',
                orderDirection: 'desc',
                block: {
                    number: voteBlock
                }
            },
            id: true,
            weight: true
        }
    };
    const results = await (0, utils_1.subgraphRequest)(SC_GRAPH_URL, query);
    if (!results) {
        return;
    }
    const delegates = {};
    addresses.forEach((address) => {
        delegates[address] = 0;
        for (let i = 0; i < Number(options.delegateLimit); i++) {
            if (results.voteWeights[i].id == address.toLowerCase()) {
                delegates[address] = 1;
            }
        }
    });
    return delegates;
}
exports.strategy = strategy;
