"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
exports.author = 'joaomajesus';
exports.version = '1.0.0';
let log = [];
let _options;
function printLog() {
    if (_options.log || false) {
        console.debug(log);
        log = [];
    }
}
function applyAntiWhaleMeasures(result) {
    const threshold = _options.antiWhale.threshold == null || _options.antiWhale.threshold <= 0
        ? 1625
        : _options.antiWhale.threshold;
    let inflectionPoint = _options.antiWhale.inflectionPoint == null ||
        _options.antiWhale.inflectionPoint <= 0
        ? 6500
        : _options.antiWhale.inflectionPoint;
    inflectionPoint = inflectionPoint < threshold ? threshold : inflectionPoint;
    const exponent = _options.antiWhale.exponent == null || _options.antiWhale.exponent <= 0
        ? 0.5
        : _options.antiWhale.exponent > 1
            ? 1
            : _options.antiWhale.exponent;
    log.push(`inflectionPoint = ${inflectionPoint}`);
    log.push(`exponent = ${exponent}`);
    log.push(`threshold = ${threshold}`);
    printLog();
    if (result > threshold) {
        result = inflectionPoint * (result / inflectionPoint) ** exponent;
    }
    else {
        const thresholdMultiplier = (inflectionPoint * (threshold / inflectionPoint) ** exponent) / threshold;
        log.push(`thresholdMultiplier = ${thresholdMultiplier}`);
        result = result * thresholdMultiplier;
    }
    log.push(`result = ${result}`);
    printLog();
    return result;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    _options = options;
    const result = await __1.default[options.strategy.name].strategy(space, network, provider, addresses, options.strategy.params, snapshot);
    const entries = new Map();
    for (const [address, value] of Object.entries(result)) {
        entries.set(address, applyAntiWhaleMeasures(value));
    }
    return Object.fromEntries(entries);
}
exports.strategy = strategy;
