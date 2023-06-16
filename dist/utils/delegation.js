"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelegationsData = exports.getDelegations = exports.getDelegationsBySpaceAndAddresses = exports.getDelegationsBySpaceAndAddressesFromGraphAPI = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../utils");
const DELEGATION_DATA_CACHE = {};
function filterDelegationDataByAddresses(delegatesBySpace, addresses) {
    const addressesLc = addresses.map((addresses) => addresses.toLowerCase());
    const delegations = delegatesBySpace.filter((delegation) => addressesLc.includes(delegation.delegate) &&
        !addressesLc.includes(delegation.delegator));
    if (!delegations)
        return {};
    const delegationsReverse = {};
    delegations.forEach((delegation) => (delegationsReverse[delegation.delegator] = delegation.delegate));
    delegations
        .filter((delegation) => delegation.space !== '')
        .forEach((delegation) => (delegationsReverse[delegation.delegator] = delegation.delegate));
    const data = Object.fromEntries(addresses.map((address) => [
        address,
        Object.entries(delegationsReverse)
            .filter(([, delegate]) => address.toLowerCase() === delegate)
            .map(([delegator]) => (0, address_1.getAddress)(delegator))
    ]));
    return data;
}
async function getDelegationsBySpaceAndAddressesFromGraphAPI(space, network, addresses, snapshot = 'latest') {
    const url = utils_1.SNAPSHOT_SUBGRAPH_URL[network];
    if (!url) {
        return Promise.reject(`Delegation subgraph not available for network ${network}`);
    }
    const PAGE_SIZE = 1000;
    let result = [];
    let page = 0;
    const spaceIn = ['', space];
    if (space.includes('.eth'))
        spaceIn.push(space.replace('.eth', ''));
    const orCondition = addresses.map((address) => ({
        delegate: address,
        space_in: spaceIn
    }));
    const params = {
        delegations: {
            __args: {
                where: {
                    or: orCondition
                },
                first: 1000,
                skip: 0
            },
            delegator: true,
            space: true,
            delegate: true
        }
    };
    if (snapshot !== 'latest') {
        params.delegations.__args.block = { number: snapshot };
    }
    while (true) {
        params.delegations.__args.skip = page * PAGE_SIZE;
        const pageResult = await (0, utils_1.subgraphRequest)(url, params);
        const pageDelegations = pageResult.delegations || [];
        result = result.concat(pageDelegations);
        page++;
        if (pageDelegations.length < PAGE_SIZE)
            break;
    }
    return result;
}
exports.getDelegationsBySpaceAndAddressesFromGraphAPI = getDelegationsBySpaceAndAddressesFromGraphAPI;
async function getDelegationsBySpaceAndAddresses(space, network, addresses, snapshot) {
    const delegatesBySpace = await getDelegationsBySpaceAndAddressesFromGraphAPI(space, network, addresses, snapshot);
    const data = filterDelegationDataByAddresses(delegatesBySpace, addresses);
    return data;
}
exports.getDelegationsBySpaceAndAddresses = getDelegationsBySpaceAndAddresses;
// delegations with overrides
async function getDelegations(space, network, addresses, snapshot) {
    const delegatesBySpace = await (0, utils_1.getDelegatesBySpace)(network, space, snapshot);
    const data = filterDelegationDataByAddresses(delegatesBySpace, addresses);
    return data;
}
exports.getDelegations = getDelegations;
function getDelegationReverseData(delegation) {
    return {
        delegate: delegation.delegate,
        delegateAddress: (0, address_1.getAddress)(delegation.delegate),
        delegator: delegation.delegator,
        delegatorAddress: (0, address_1.getAddress)(delegation.delegator)
    };
}
async function getDelegationsData(space, network, addresses, snapshot) {
    const cacheKey = `${space}-${network}-${snapshot}`;
    let delegationsReverse = DELEGATION_DATA_CACHE[cacheKey];
    if (!delegationsReverse) {
        delegationsReverse = {};
        const delegatesBySpace = await getDelegationsBySpaceAndAddresses(space, network, addresses, snapshot);
        delegatesBySpace.forEach((delegation) => (delegationsReverse[delegation.delegator] =
            getDelegationReverseData(delegation)));
        delegatesBySpace
            .filter((delegation) => delegation.space !== '')
            .forEach((delegation) => (delegationsReverse[delegation.delegator] =
            getDelegationReverseData(delegation)));
        if (space === 'stgdao.eth' && snapshot !== 'latest') {
            // TODO: implement LRU so memory doesn't explode
            // we only cache stgdao for now
            console.log(`[with-delegation] Caching ${cacheKey}`);
            DELEGATION_DATA_CACHE[cacheKey] = delegationsReverse;
        }
    }
    return {
        delegations: Object.fromEntries(addresses.map((address) => [
            address,
            Object.values(delegationsReverse)
                .filter((data) => address.toLowerCase() === data.delegate)
                .map((data) => data.delegatorAddress)
        ])),
        allDelegators: Object.values(delegationsReverse).map((data) => data.delegatorAddress)
    };
}
exports.getDelegationsData = getDelegationsData;
