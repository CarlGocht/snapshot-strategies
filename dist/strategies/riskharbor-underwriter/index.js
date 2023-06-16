"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'dewpe';
exports.version = '0.1.1';
async function strategy(_space, _network, _provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const positionsQuery = {
        underwriterPositions: {
            __args: {
                where: {
                    shares_not: '0',
                    vault: options.VAULT_ADDR.toLowerCase(),
                    user_in: addresses.map((addr) => addr.toLowerCase())
                },
                block: blockTag != 'latest' ? { number: blockTag } : null,
                first: 1000
            },
            shares: true,
            user: {
                id: true
            }
        }
    };
    const decimalsQuery = {
        vault: {
            __args: {
                id: options.VAULT_ADDR.toLowerCase(),
                block: blockTag != 'latest' ? { number: blockTag } : null
            },
            underwritingToken: {
                decimals: true
            }
        }
    };
    const decimals = (await (0, utils_1.subgraphRequest)(options.SUBGRAPH_URL, decimalsQuery))
        .vault.underwritingToken.decimals;
    const positions = (await (0, utils_1.subgraphRequest)(options.SUBGRAPH_URL, positionsQuery)).underwriterPositions;
    // Go through each position and reduce it down to the form:
    // userAddr: balance
    const agUserBals = {};
    positions.forEach((position) => {
        const shares = bignumber_1.BigNumber.from(position.shares);
        if (shares.isZero())
            return;
        // If key already has a value, then increase it
        if (agUserBals[position.user.id]) {
            agUserBals[position.user.id] = agUserBals[position.user.id].add(shares);
        }
        else {
            agUserBals[position.user.id] = shares;
        }
    });
    return Object.fromEntries(Object.entries(agUserBals).map(([address, balance]) => [
        (0, address_1.getAddress)(address),
        // Divide each bal by 1eDecimals
        parseFloat((0, units_1.formatUnits)(balance, decimals))
    ]));
}
exports.strategy = strategy;
