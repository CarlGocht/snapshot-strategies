"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelegationsData = exports.getDelegations = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../utils");
const DELEGATION_DATA_CACHE = {};
// delegations with overrides
async function getDelegations(space, network, addresses, snapshot) {
    const addressesLc = addresses.map((addresses) => addresses.toLowerCase());
    const delegatesBySpace = await (0, utils_1.getDelegatesBySpace)(network, space, snapshot);
    const delegations = delegatesBySpace.filter((delegation) => addressesLc.includes(delegation.delegate) &&
        !addressesLc.includes(delegation.delegator));
    if (!delegations)
        return {};
    const delegationsReverse = {};
    delegations.forEach((delegation) => (delegationsReverse[delegation.delegator] = delegation.delegate));
    delegations
        .filter((delegation) => delegation.space !== '')
        .forEach((delegation) => (delegationsReverse[delegation.delegator] = delegation.delegate));
    return Object.fromEntries(addresses.map((address) => [
        address,
        Object.entries(delegationsReverse)
            .filter(([, delegate]) => address.toLowerCase() === delegate)
            .map(([delegator]) => (0, address_1.getAddress)(delegator))
    ]));
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
        const delegatesBySpace = await (0, utils_1.getDelegatesBySpace)(network, space, snapshot);
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
