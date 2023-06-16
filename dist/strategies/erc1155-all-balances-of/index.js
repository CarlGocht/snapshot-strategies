"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'snapshot-labs';
exports.version = '0.2.0';
const SUBGRAPH_URL = {
    '1': 'https://gateway.thegraph.com/api/94c3f5dd3947e2f62fc6e0e757549ee7/subgraphs/id/GCQVLurkeZrdMf4t5v5NyeWJY8pHhfE9sinjFMjLYd9C'
};
const HOSTED_SUBGRAPH_URL = {
    '137': 'https://api.thegraph.com/subgraphs/name/tranchien2002/eip1155-matic'
};
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const PAGE_SIZE = 1000;
    let result = [];
    let page = 0;
    const isHosted = HOSTED_SUBGRAPH_URL[network] !== undefined;
    const subgraphURL = isHosted
        ? HOSTED_SUBGRAPH_URL[network]
        : SUBGRAPH_URL[network];
    const eip1155BalancesParams = {
        balances: {
            __aliasFor: 'erc1155Balances',
            __args: {
                first: PAGE_SIZE,
                skip: 0,
                where: {
                    account_in: addresses.map((a) => a.toLowerCase()),
                    token_starts_with: options.address.toLowerCase(),
                    value_not: '0'
                }
            },
            account: {
                id: true
            },
            value: true,
            valueExact: true
        }
    };
    if (snapshot !== 'latest') {
        eip1155BalancesParams.balances.__args.block = { number: snapshot };
    }
    // No erc1155balances alias and valueExact for hosted subgraph
    if (isHosted) {
        delete eip1155BalancesParams.balances.__aliasFor;
        delete eip1155BalancesParams.balances.valueExact;
    }
    while (true) {
        eip1155BalancesParams.balances.__args.skip = page * PAGE_SIZE;
        const pageResult = await (0, utils_1.subgraphRequest)(subgraphURL, eip1155BalancesParams);
        const pageERC1155Balances = pageResult.balances || [];
        result = result.concat(pageERC1155Balances);
        page++;
        if (pageERC1155Balances.length < PAGE_SIZE)
            break;
        // hosted subgraph doesn't support skip more than 5000
        if (isHosted && page === 6)
            break;
    }
    return result.reduce((acc, val) => {
        const address = (0, address_1.getAddress)(val.account.id);
        const value = parseInt(isHosted ? val.value : val.valueExact, 10);
        if (!acc[address])
            acc[address] = 0;
        acc[address] += value;
        return acc;
    }, {});
}
exports.strategy = strategy;
