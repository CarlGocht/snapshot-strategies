"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const __1 = __importDefault(require(".."));
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const { validationStrategies = [], votingStrategies = [], validationThreshold = 1 } = options;
    // Limit validationStrategies to 3 strategies
    if (validationStrategies.length === 0 || votingStrategies.length === 0) {
        throw new Error('No validation strategies provided.');
    }
    if (validationStrategies.length > 3 || votingStrategies.length > 3) {
        throw new Error('Too many strategies provided.');
    }
    const promises = [];
    for (const strategy of validationStrategies) {
        promises.push(__1.default[strategy.name].strategy(space, network, provider, addresses, strategy.params, snapshot));
    }
    const results = await Promise.all(promises);
    let validatedAddresses = [];
    results.forEach((result) => {
        for (const address in result) {
            if (result[address] >= validationThreshold) {
                validatedAddresses.push((0, address_1.getAddress)(address));
            }
        }
    });
    validatedAddresses = [...new Set(validatedAddresses)];
    const scores = {};
    if (validatedAddresses.length > 0) {
        const promises = [];
        for (const strategy of votingStrategies) {
            promises.push(__1.default[strategy.name].strategy(space, network, provider, validatedAddresses, strategy.params, snapshot));
        }
        const results = await Promise.all(promises);
        results.forEach((result) => {
            for (const address in result) {
                if (!scores[address])
                    scores[address] = 0;
                scores[address] += result[address];
            }
        });
    }
    return scores;
}
exports.strategy = strategy;
