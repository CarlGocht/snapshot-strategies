"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
const options_1 = require("./options");
exports.author = 'xJonathanLEI';
exports.version = '0.2.2';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const rawOptions = (0, options_1.migrateLegacyOptions)(options);
    const strategyOptions = (0, options_1.validateOptions)(rawOptions);
    // Recursively resolve operands
    const operandPromises = strategyOptions.operands.map((item) => resolveOperand(item, addresses, space, network, provider, snapshot));
    const resolvedOperands = await Promise.all(operandPromises);
    const finalResult = resolveOperation(strategyOptions.operation, resolvedOperands);
    return finalResult;
}
exports.strategy = strategy;
function resolveOperation(operation, resolvedOperands) {
    switch (operation) {
        case options_1.Operation.SquareRoot: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [address, Math.sqrt(score)]));
        }
        case options_1.Operation.CubeRoot: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [address, Math.cbrt(score)]));
        }
        case options_1.Operation.Min: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                Math.min(score, resolvedOperands[1][address])
            ]));
        }
        case options_1.Operation.Max: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                Math.max(score, resolvedOperands[1][address])
            ]));
        }
        case options_1.Operation.AIfLtB: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score < resolvedOperands[2][address]
                    ? resolvedOperands[1][address]
                    : score
            ]));
        }
        case options_1.Operation.AIfLteB: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score <= resolvedOperands[2][address]
                    ? resolvedOperands[1][address]
                    : score
            ]));
        }
        case options_1.Operation.AIfGtB: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score > resolvedOperands[2][address]
                    ? resolvedOperands[1][address]
                    : score
            ]));
        }
        case options_1.Operation.AIfGteB: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score >= resolvedOperands[2][address]
                    ? resolvedOperands[1][address]
                    : score
            ]));
        }
        case options_1.Operation.Multiply: {
            return Object.fromEntries(Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score * resolvedOperands[1][address]
            ]));
        }
        case options_1.Operation.MINUS: {
            const arr = Object.entries(resolvedOperands[0]).map(([address, score]) => [
                address,
                score > resolvedOperands[1][address]
                    ? score - resolvedOperands[1][address]
                    : 0
            ]);
            return Object.fromEntries(arr);
        }
    }
}
async function resolveOperand(operand, addresses, space, network, provider, snapshot) {
    switch (operand.type) {
        case options_1.OperandType.Strategy: {
            const strategyOperand = operand;
            const upstreamResult = await __1.default[strategyOperand.strategy.name].strategy(space, strategyOperand.strategy.network ?? network, provider, addresses, strategyOperand.strategy.params, snapshot);
            return upstreamResult;
        }
        case options_1.OperandType.Constant: {
            const constantOperand = operand;
            return Object.fromEntries(addresses.map((address) => [address, constantOperand.value]));
        }
    }
}
