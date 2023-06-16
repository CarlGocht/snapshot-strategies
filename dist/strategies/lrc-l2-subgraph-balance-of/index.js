"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
exports.author = 'shad-k';
exports.version = '0.1.1';
const LIMIT = 500;
function makeQuery(snapshot, addresses, tokenId) {
    const query = {
        accounts: {
            __args: {
                where: {
                    address_in: addresses
                },
                first: LIMIT
            },
            balances: {
                __args: {
                    where: {
                        token_in: [`${tokenId}`]
                    }
                },
                balance: true,
                token: {
                    decimals: true
                }
            },
            address: true
        }
    };
    if (snapshot !== 'latest') {
        query.accounts.__args = {
            ...query.accounts.__args,
            block: {
                number: snapshot
            }
        };
    }
    return query;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const _addresses = addresses.map((address) => address.toLowerCase());
    const addressSubsets = Array.apply(null, Array(Math.ceil(_addresses.length / LIMIT))).map((_e, i) => _addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const response = await Promise.all(addressSubsets.map((subset) => (0, utils_1.subgraphRequest)(options.graph, makeQuery(snapshot, subset, options.tokenId))));
    const accounts = response.map((data) => data.accounts).flat();
    const addressToBalanceMap = Object.fromEntries(accounts.map((account) => {
        if (account.balances.length > 0) {
            return [
                account.address,
                bignumber_1.BigNumber.from(account.balances[0].balance)
                    .div(bignumber_1.BigNumber.from(10).pow(account.balances[0]?.token?.decimals ?? 18))
                    .toNumber()
            ];
        }
        return [account.address, 0];
    }));
    const scores = Object.fromEntries(addresses.map((address) => [
        address,
        addressToBalanceMap[address.toLowerCase()]
    ]));
    return scores;
}
exports.strategy = strategy;
