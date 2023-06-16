"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResults = exports.verifyResultsLength = void 0;
function verifyResultsLength(result, expectedResults, type) {
    result === expectedResults
        ? console.log(`>>> SUCCESS: ${type} match expected results - length`)
        : console.error(`>>> ERROR: ${type} do not match expected results - length`);
}
exports.verifyResultsLength = verifyResultsLength;
function verifyResults(result, expectedResults, type) {
    result === expectedResults
        ? console.log(`>>> SUCCESS: ${type} match expected results`)
        : console.error(`>>> ERROR: ${type} do not match expected results`);
}
exports.verifyResults = verifyResults;
