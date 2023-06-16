"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDelegations = exports.getDelegationsIn = exports.getDelegationOut = exports.getDelegationsOut = exports.getVp = void 0;
const strings_1 = require("@ethersproject/strings");
const address_1 = require("@ethersproject/address");
const delegationSubgraphs_json_1 = __importDefault(require("@snapshot-labs/snapshot.js/src/delegationSubgraphs.json"));
const utils_1 = require("../utils");
const strategies_1 = __importDefault(require("../strategies"));
const DELEGATION_CONTRACT = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446';
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const EMPTY_SPACE = (0, strings_1.formatBytes32String)('');
const abi = ['function delegation(address, bytes32) view returns (address)'];
async function getVp(address, network, strategies, snapshot, space, delegation) {
    const networks = [...new Set(strategies.map((s) => s.network || network))];
    const snapshots = await (0, utils_1.getSnapshots)(network, snapshot, (0, utils_1.getProvider)(network), networks);
    const delegations = {};
    if (delegation) {
        const ds = await Promise.all(networks.map((n) => getDelegations(address, n, snapshots[n], space)));
        ds.forEach((d, i) => (delegations[networks[i]] = d));
    }
    const p = strategies.map((strategy) => {
        const n = strategy.network || network;
        let addresses = [address];
        if (delegation) {
            addresses = delegations[n].in;
            if (!delegations[n].out)
                addresses.push(address);
            addresses = [...new Set(addresses)];
            if (addresses.length === 0)
                return {};
        }
        addresses = addresses.map(address_1.getAddress);
        return strategies_1.default[strategy.name].strategy(space, n, (0, utils_1.getProvider)(n), addresses, strategy.params, snapshots[n]);
    });
    const scores = await Promise.all(p);
    const vpByStrategy = scores.map((score, i) => {
        const n = strategies[i].network || network;
        let addresses = [address];
        if (delegation) {
            addresses = delegations[n].in;
            if (!delegations[n].out)
                addresses.push(address);
            addresses = [...new Set(addresses)];
        }
        addresses = addresses.map(address_1.getAddress);
        return addresses.reduce((a, b) => a + (score[b] || 0), 0);
    });
    const vp = vpByStrategy.reduce((a, b) => a + b, 0);
    let vpState = 'final';
    if (snapshot === 'latest')
        vpState = 'pending';
    return {
        vp,
        vp_by_strategy: vpByStrategy,
        vp_state: vpState
    };
}
exports.getVp = getVp;
async function getDelegationsOut(addresses, network, snapshot, space) {
    if (!delegationSubgraphs_json_1.default[network])
        return Object.fromEntries(addresses.map((address) => [address, null]));
    const id = (0, strings_1.formatBytes32String)(space);
    const options = { blockTag: snapshot };
    const multi = new utils_1.Multicaller(network, (0, utils_1.getProvider)(network), abi, options);
    addresses.forEach((account) => {
        multi.call(`${account}.base`, DELEGATION_CONTRACT, 'delegation', [
            account,
            EMPTY_SPACE
        ]);
        multi.call(`${account}.space`, DELEGATION_CONTRACT, 'delegation', [
            account,
            id
        ]);
    });
    const delegations = await multi.execute();
    return Object.fromEntries(Object.entries(delegations).map(([address, delegation]) => {
        if (delegation.space !== EMPTY_ADDRESS)
            return [address, delegation.space];
        if (delegation.base !== EMPTY_ADDRESS)
            return [address, delegation.base];
        return [address, null];
    }));
}
exports.getDelegationsOut = getDelegationsOut;
async function getDelegationOut(address, network, snapshot, space) {
    const usersDelegationOut = await getDelegationsOut([address], network, snapshot, space);
    return usersDelegationOut[address] || null;
}
exports.getDelegationOut = getDelegationOut;
async function getDelegationsIn(address, network, snapshot, space) {
    if (!delegationSubgraphs_json_1.default[network])
        return [];
    const max = 1000;
    let result = [];
    let page = 0;
    const query = {
        delegations: {
            __args: {
                first: max,
                skip: 0,
                block: { number: snapshot },
                where: {
                    space_in: ['', space],
                    delegate: address
                }
            },
            delegator: true,
            space: true
        }
    };
    // @ts-ignore
    if (snapshot === 'latest')
        delete query.delegations.__args.block;
    while (true) {
        query.delegations.__args.skip = page * max;
        const pageResult = await (0, utils_1.subgraphRequest)(delegationSubgraphs_json_1.default[network], query);
        const pageDelegations = pageResult.delegations || [];
        result = result.concat(pageDelegations);
        page++;
        if (pageDelegations.length < max)
            break;
    }
    const delegations = [];
    let baseDelegations = [];
    result.forEach((delegation) => {
        const delegator = (0, address_1.getAddress)(delegation.delegator);
        if (delegation.space === space)
            delegations.push(delegator);
        if ([null, ''].includes(delegation.space))
            baseDelegations.push(delegator);
    });
    baseDelegations = baseDelegations.filter((delegator) => !delegations.includes(delegator));
    if (baseDelegations.length > 0) {
        const delegationsOut = await getDelegationsOut(baseDelegations, network, snapshot, space);
        Object.entries(delegationsOut).map(([delegator, out]) => {
            if (out === address)
                delegations.push(delegator);
        });
    }
    return [...new Set(delegations)];
}
exports.getDelegationsIn = getDelegationsIn;
async function getDelegations(address, network, snapshot, space) {
    const [delegationOut, delegationsIn] = await Promise.all([
        getDelegationOut(address, network, snapshot, space),
        getDelegationsIn(address, network, snapshot, space)
    ]);
    return {
        in: delegationsIn,
        out: delegationOut
    };
}
exports.getDelegations = getDelegations;
