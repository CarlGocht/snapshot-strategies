"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const meebitsdao_1 = require("../meebitsdao");
const erc20_balance_of_1 = require("../erc20-balance-of");
const erc721_1 = require("../erc721");
const utils_1 = require("../../utils");
exports.author = 'maikir';
exports.version = '0.2.0';
const MEEBITSDAO_DELEGATION_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/maikir/meebitsdao-delegation';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blocks = await (0, utils_1.getSnapshots)(network, snapshot, provider, options.tokenAddresses.map((s) => s.network || network));
    const PAGE_SIZE = 1000;
    let result = [];
    let page = 0;
    const params = {
        delegations: {
            __args: {
                first: PAGE_SIZE,
                skip: 0
            },
            delegator: true,
            delegate: true
        }
    };
    if (snapshot !== 'latest') {
        params.delegations.__args.block = { number: snapshot };
    }
    //This function may only run to 6000 queries total (first: 1000 * 6 pages). After that, the query may return 0 results even though there may be more.
    while (true) {
        params.delegations.__args.skip = page * PAGE_SIZE;
        const pageResult = await (0, utils_1.subgraphRequest)(MEEBITSDAO_DELEGATION_SUBGRAPH_URL, params);
        const pageDelegations = pageResult.delegations || [];
        result = result.concat(pageDelegations);
        page++;
        if (pageDelegations.length < PAGE_SIZE)
            break;
    }
    const lowerCaseAddresses = [];
    addresses.forEach((address) => {
        lowerCaseAddresses.push(address.toLowerCase());
    });
    const mvoxAddresses = [];
    result.forEach((delegation) => {
        mvoxAddresses.push(delegation.delegator);
    });
    const mvoxScores = await (0, erc20_balance_of_1.strategy)(space, network, provider, mvoxAddresses, options.tokenAddresses[0], snapshot);
    const mfndScores = await (0, meebitsdao_1.strategy)(space, network, provider, lowerCaseAddresses, options.tokenAddresses[1], snapshot);
    const meebitsScores = await (0, erc721_1.strategy)(space, options.tokenAddresses[2].network, (0, utils_1.getProvider)(options.tokenAddresses[2].network), lowerCaseAddresses, options.tokenAddresses[2], blocks[options.tokenAddresses[2].network]);
    const delegations = {};
    result.forEach((delegation) => {
        let meebitsScore = 0;
        let mvoxScore = 0;
        if (delegation.delegator in mvoxScores &&
            delegation.delegate in meebitsScores) {
            meebitsScore = Math.max(1, Math.min(20, meebitsScores[delegation.delegate]));
            mvoxScore = mvoxScores[delegation.delegator];
        }
        if (delegation.delegate in delegations) {
            delegations[delegation.delegate] += mvoxScore * meebitsScore;
        }
        else {
            delegations[delegation.delegate] = mvoxScore * meebitsScore;
        }
    });
    const entries = Object.entries(mfndScores).map((address) => {
        const founderAddress = address[0].toLowerCase();
        return [
            (0, address_1.getAddress)(founderAddress),
            Math.min(founderAddress in delegations
                ? Math.max(address[1], delegations[founderAddress])
                : address[1], 1000)
        ];
    });
    const score = Object.fromEntries(entries);
    return score || {};
}
exports.strategy = strategy;
