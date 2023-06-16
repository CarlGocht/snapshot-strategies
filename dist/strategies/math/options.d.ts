export declare type Operand = StrategyOperand | ConstantOperand;
export interface Options {
    operands: Operand[];
    operation: Operation;
}
export interface StrategyOperand {
    type: OperandType.Strategy;
    strategy: any;
}
export interface ConstantOperand {
    type: OperandType.Constant;
    value: number;
}
export declare enum OperandType {
    Strategy = "strategy",
    Constant = "constant"
}
export declare enum Operation {
    SquareRoot = "square-root",
    CubeRoot = "cube-root",
    Min = "min",
    Max = "max",
    AIfLtB = "a-if-lt-b",
    AIfLteB = "a-if-lte-b",
    AIfGtB = "a-if-gt-b",
    AIfGteB = "a-if-gte-b",
    Multiply = "multiply",
    MINUS = "minus"
}
interface LegacyFields {
    strategy: any;
}
export declare type OptionalOperand = OptionalStrategyOperand | OptionalConstantOperand;
export interface OptionalOptions {
    operands: OptionalOperand[] | undefined;
    operation: Operation | undefined;
}
export interface OptionalStrategyOperand {
    type: OperandType.Strategy | undefined;
    strategy: any | undefined;
}
export interface OptionalConstantOperand {
    type: OperandType.Constant | undefined;
    value: number | undefined;
}
export declare function validateOptions(rawOptions: OptionalOptions): Options;
export declare function migrateLegacyOptions(options: OptionalOptions & LegacyFields): OptionalOptions;
export {};
