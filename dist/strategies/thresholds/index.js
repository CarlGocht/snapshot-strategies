"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const thresholds = options.thresholds || [{ threshold: 1, votes: 1 }];
    if (thresholds.length == 0)
        thresholds.push({ threshold: 1, votes: 1 });
    const calculateVotes = (balance) => thresholds
        .sort((a, b) => b.threshold - a.threshold)
        .find((t) => t.threshold <= balance)?.votes ?? 0;
    const response = await __1.default[options.strategy.name].strategy(space, network, provider, addresses, options.strategy.params, snapshot);
    return Object.fromEntries(Object.keys(response).map((address) => [
        address,
        calculateVotes(response[address])
    ]));
}
exports.strategy = strategy;
