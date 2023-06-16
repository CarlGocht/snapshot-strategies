"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimCoefficient = exports.maturitiesCoefficient = void 0;
const oneDaySeconds = 86400;
const maturitiesCoefficient = (maturities) => {
    const nowData = Date.parse(new Date().toString()) / 1000;
    const difference = maturities[maturities.length - 1].toNumber() - nowData;
    if (difference <= 0) {
        return 1;
    }
    else if (difference > 0 && difference <= 90 * oneDaySeconds) {
        return 1.1;
    }
    else if (difference > 90 * oneDaySeconds &&
        difference <= 183 * oneDaySeconds) {
        return 1.2;
    }
    else if (difference > 183 * oneDaySeconds &&
        difference <= 365 * oneDaySeconds) {
        return 1.5;
    }
    else {
        return 2;
    }
};
exports.maturitiesCoefficient = maturitiesCoefficient;
const claimCoefficient = (claimType) => {
    if (claimType == 0) {
        return 1.2;
    }
    else if (claimType == 1) {
        return 2;
    }
    else if (claimType == 2) {
        return 1.5;
    }
    else {
        return 1;
    }
};
exports.claimCoefficient = claimCoefficient;
