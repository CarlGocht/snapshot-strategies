"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEmission = exports.squareRoot = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const ZERO = bignumber_1.BigNumber.from(0);
const ONE = bignumber_1.BigNumber.from(1);
const TWO = bignumber_1.BigNumber.from(2);
const THREE = bignumber_1.BigNumber.from(3);
const squareRoot = (y) => {
    let z = ZERO;
    if (y.gt(THREE)) {
        z = y;
        let x = y.div(TWO).add(ONE);
        while (x.lt(z)) {
            z = x;
            x = y.div(x).add(x).div(TWO);
        }
    }
    else if (!y.isZero()) {
        z = ONE;
    }
    return z;
};
exports.squareRoot = squareRoot;
const YEAR = bignumber_1.BigNumber.from(31536000); // year in seconds
const ONE_ETHER = bignumber_1.BigNumber.from('1000000000000000000');
const MAX_EMISSION_RATE = bignumber_1.BigNumber.from('150000000000000000'); // 15%
const calculateEmission = (deposit, timePassed, sigmoidParams, totalSupplyFactor, totalSupply, totalStaked) => {
    const d = timePassed.sub(sigmoidParams.b);
    let personalEmissionRate = ZERO;
    if (d.gt(ZERO)) {
        personalEmissionRate = sigmoidParams.a
            .mul(d)
            .div((0, exports.squareRoot)(d.pow(TWO).add(sigmoidParams.c)));
    }
    const targetTotalStaked = totalSupply.mul(totalSupplyFactor).div(ONE_ETHER);
    let generalEmissionRate = MAX_EMISSION_RATE.div(TWO);
    if (totalStaked.lt(targetTotalStaked)) {
        generalEmissionRate = generalEmissionRate
            .mul(totalStaked)
            .div(targetTotalStaked);
    }
    if (personalEmissionRate.isZero()) {
        generalEmissionRate = ZERO;
    }
    const emissionRate = personalEmissionRate.add(generalEmissionRate);
    const emission = deposit
        .mul(emissionRate)
        .mul(timePassed)
        .div(YEAR.mul(ONE_ETHER));
    return emission;
};
exports.calculateEmission = calculateEmission;
