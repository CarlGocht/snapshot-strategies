"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateLegacyOptions = exports.validateOptions = exports.Operation = exports.OperandType = void 0;
var OperandType;
(function (OperandType) {
    OperandType["Strategy"] = "strategy";
    OperandType["Constant"] = "constant";
})(OperandType = exports.OperandType || (exports.OperandType = {}));
var Operation;
(function (Operation) {
    Operation["SquareRoot"] = "square-root";
    Operation["CubeRoot"] = "cube-root";
    Operation["Min"] = "min";
    Operation["Max"] = "max";
    Operation["AIfLtB"] = "a-if-lt-b";
    Operation["AIfLteB"] = "a-if-lte-b";
    Operation["AIfGtB"] = "a-if-gt-b";
    Operation["AIfGteB"] = "a-if-gte-b";
    Operation["Multiply"] = "multiply";
    Operation["MINUS"] = "minus";
})(Operation = exports.Operation || (exports.Operation = {}));
const operandCountByOperation = {
    [Operation.SquareRoot]: 1,
    [Operation.CubeRoot]: 1,
    [Operation.Multiply]: 2,
    [Operation.Min]: 2,
    [Operation.Max]: 2,
    [Operation.AIfLtB]: 3,
    [Operation.AIfLteB]: 3,
    [Operation.AIfGtB]: 3,
    [Operation.AIfGteB]: 3,
    [Operation.MINUS]: 2
};
function validateOptions(rawOptions) {
    if (!rawOptions.operands) {
        throw new Error('Field `operands` missing');
    }
    if (!rawOptions.operation) {
        throw new Error('Field `operation` missing');
    }
    if (rawOptions.operation !== Operation.SquareRoot &&
        rawOptions.operation !== Operation.CubeRoot &&
        rawOptions.operation !== Operation.Min &&
        rawOptions.operation !== Operation.Max &&
        rawOptions.operation !== Operation.AIfLtB &&
        rawOptions.operation !== Operation.AIfLteB &&
        rawOptions.operation !== Operation.AIfGtB &&
        rawOptions.operation !== Operation.AIfGteB &&
        rawOptions.operation !== Operation.Multiply &&
        rawOptions.operation !== Operation.MINUS) {
        throw new Error('Invalid `operation`');
    }
    if (rawOptions.operands.length !== operandCountByOperation[rawOptions.operation]) {
        throw new Error('Operand count mismatch');
    }
    const options = {
        operands: [],
        operation: rawOptions.operation
    };
    for (const operand of rawOptions.operands) {
        switch (operand.type) {
            case OperandType.Strategy: {
                options.operands.push({
                    type: OperandType.Strategy,
                    strategy: operand.strategy
                });
                break;
            }
            case OperandType.Constant: {
                if (operand.value === undefined) {
                    throw new Error('Invalid constant value');
                }
                options.operands.push({
                    type: OperandType.Constant,
                    value: operand.value
                });
                break;
            }
            default: {
                throw new Error(`Invalid operand type: ${operand.type}`);
            }
        }
    }
    return options;
}
exports.validateOptions = validateOptions;
function migrateLegacyOptions(options) {
    if (options.strategy && options.operands) {
        throw new Error('Only one of `strategy` and `operands` can be used');
    }
    // `strategy` was used in v0.1.0
    if (options.strategy) {
        return {
            operands: [
                {
                    type: OperandType.Strategy,
                    strategy: options.strategy
                }
            ],
            operation: options.operation
        };
    }
    else {
        return options;
    }
}
exports.migrateLegacyOptions = migrateLegacyOptions;
