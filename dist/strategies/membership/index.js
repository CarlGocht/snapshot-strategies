"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
exports.author = 'blakewest';
exports.version = '1.0.0';
/*
Membership Based Voting Strategy

Options: {
  membershipStrategy: {
    name: {strategyName},
    options: {
      ... options for the strategy
    }
  },
  votingPowerStrategy: {
    name: {strategyName},
    options: {
      ... options for the strategy
    }
  }
}

*/
async function strategy(space, network, provider, addresses, options, snapshot) {
    const validAddresses = await membershipCheck(space, network, provider, addresses, options.membershipStrategy, snapshot);
    const votingPowerStrategy = __1.default[options.votingPowerStrategy.name].strategy;
    const scores = await votingPowerStrategy(space, network, provider, validAddresses, options.votingPowerStrategy.params, snapshot);
    // Set invalid addresses to 0
    addresses
        .filter((addr) => !validAddresses.includes(addr))
        .forEach((addr) => (scores[addr] = 0));
    return scores;
}
exports.strategy = strategy;
async function membershipCheck(space, network, provider, addresses, strategy, snapshot) {
    const strategyFn = __1.default[strategy.name].strategy;
    const result = await strategyFn(space, network, provider, addresses, strategy.params, snapshot);
    return Object.entries(result)
        .map(([address, val]) => {
        if (val > 0) {
            return address;
        }
        else {
            return '';
        }
    })
        .filter((item) => item);
}
