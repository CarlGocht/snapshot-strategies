"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
const xdai_easy_staking_1 = require("../xdai-easy-staking");
const xdai_posdao_staking_1 = require("../xdai-posdao-staking");
const xdai_stake_holders_1 = require("../xdai-stake-holders");
const delegation_1 = require("../../utils/delegation");
exports.author = 'maxaleks';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const delegations = await (0, delegation_1.getDelegations)(space, network, addresses, snapshot);
    if (Object.keys(delegations).length === 0)
        return {};
    const delegationsArray = Object.values(delegations).reduce((a, b) => a.concat(b));
    const erc20Balances = await (0, erc20_balance_of_1.strategy)(space, network, provider, delegationsArray, options, snapshot);
    const easyStakingBalances = await (0, xdai_easy_staking_1.strategy)(space, network, provider, delegationsArray, options, snapshot);
    const posdaoStakingBalances = await (0, xdai_posdao_staking_1.strategy)(space, network, provider, delegationsArray, options, snapshot);
    const erc20BalancesOnXdai = await (0, xdai_stake_holders_1.strategy)(space, network, provider, delegationsArray, options, snapshot);
    // console.debug('Delegators ERC20 balances', erc20Balances);
    // console.debug('Delegators EasyStaking balances', easyStakingBalances);
    // console.debug('Delegators POSDAO Staking balances', posdaoStakingBalances);
    // console.debug('Delegators ERC20 balances on xDai', erc20BalancesOnXdai);
    return Object.fromEntries(addresses.map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => a +
                erc20Balances[b] +
                easyStakingBalances[b] +
                posdaoStakingBalances[b] +
                erc20BalancesOnXdai[b], 0)
            : 0;
        return [address, addressScore];
    }));
}
exports.strategy = strategy;
