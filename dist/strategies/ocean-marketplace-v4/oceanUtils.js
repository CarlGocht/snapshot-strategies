"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResults = exports.verifyResultsLength = void 0;
function verifyResultsLength(result, expectedResults, type) {
    if (result === expectedResults) {
        console.log(`>>> SUCCESS: ${type} result:[${result}] match expected results:[${expectedResults}] - length`);
    }
    else {
        console.error(`>>> ERROR: ${type} result:[${result}] do not match expected results:[${expectedResults}] - length`);
    }
}
exports.verifyResultsLength = verifyResultsLength;
function verifyResults(result, expectedResults, type) {
    if (result === expectedResults) {
        console.log(`>>> SUCCESS: ${type} result:[${result}] match expected results:[${expectedResults}]`);
    }
    else {
        console.error(`>>> ERROR: ${type} result:[${result}] do not match expected results:[${expectedResults}]`);
    }
}
exports.verifyResults = verifyResults;
