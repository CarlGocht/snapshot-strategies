"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const erc721_1 = require("../erc721");
exports.author = 'greenealexander';
exports.version = '1.2.0';
// subgraph query in filter has max length of 500
const EVENT_IDS_LIMIT = 500;
const POAP_API_ENDPOINT_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/poap-xyz/poap',
    '100': 'https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai'
};
// subgraph query in filter has max length of 500
const MAX_ACCOUNTS_IN_QUERY = 500;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const shouldFilterForEvents = (options?.eventIds?.length ?? 0) > 0;
    if (!shouldFilterForEvents) {
        const results = await (0, erc721_1.strategy)(space, network, provider, addresses, { address: '0x22C1f6050E56d2876009903609a2cC3fEf83B415' }, snapshot);
        return addresses.reduce((map, address) => {
            map[(0, address_1.getAddress)(address)] = results[address] ?? 0;
            return map;
        }, {});
    }
    if (shouldFilterForEvents && options.eventIds.length > EVENT_IDS_LIMIT) {
        throw new Error(`Max number (${EVENT_IDS_LIMIT}) of event ids exceeded`);
    }
    const addressesMap = addresses.reduce((map, address) => {
        map[(0, address_1.getAddress)(address)] = 0;
        return map;
    }, {});
    const lowercaseAddresses = Object.keys(addressesMap).map((address) => address.toLowerCase());
    // batch addresses to query into slices of MAX_ACCOUNTS_IN_QUERY size
    const lowercaseAddressBatches = [];
    for (let i = 0; i < lowercaseAddresses.length; i += MAX_ACCOUNTS_IN_QUERY) {
        const slice = lowercaseAddresses.slice(i, i + MAX_ACCOUNTS_IN_QUERY);
        lowercaseAddressBatches.push(slice);
    }
    const query = {
        accounts: {
            __args: {
                where: {
                    id_in: []
                }
            },
            id: true,
            tokens: {
                __args: {
                    where: {
                        event_in: options.eventIds
                    }
                },
                id: true
            }
        }
    };
    if (snapshot !== 'latest') {
        query.accounts.__args['block'] = { number: snapshot };
    }
    const results = await Promise.allSettled(lowercaseAddressBatches.map((addresses) => {
        query.accounts.__args.where.id_in = addresses;
        return (0, utils_1.subgraphRequest)(POAP_API_ENDPOINT_URL[network], query);
    }));
    for (const supplyResponse of results) {
        if (supplyResponse.status === 'rejected')
            continue;
        for (const account of supplyResponse.value.accounts) {
            const accountId = (0, address_1.getAddress)(account.id);
            if (addressesMap[accountId] === undefined)
                continue;
            addressesMap[accountId] = account.tokens?.length ?? 0;
        }
    }
    return addressesMap;
}
exports.strategy = strategy;
