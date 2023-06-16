"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const __1 = __importDefault(require(".."));
const proof_of_humanity_1 = require("../proof-of-humanity");
const brightid_1 = require("../brightid");
exports.author = 'samuveth';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    async function getProofOfHumanity() {
        if (!options?.sybil?.poh)
            return {};
        return await (0, proof_of_humanity_1.strategy)(space, '1', provider, addresses, { address: options.sybil.poh }, snapshot);
    }
    async function getBrightId() {
        if (!options?.sybil?.brightId)
            return {};
        return await (0, brightid_1.strategy)(space, network, provider, addresses, { registry: options.sybil.brightId }, snapshot);
    }
    const [scores, proofOfHumanity, brightId] = await Promise.all([
        await __1.default[options.strategy.name].strategy(space, network, provider, addresses, options.strategy.params, snapshot),
        getProofOfHumanity(),
        getBrightId()
    ]);
    // Reduce voting power of address to zero if cybil check doesn't pass
    const cybilScores = Object.keys(scores).reduce((acc, key) => {
        if (proofOfHumanity?.[key] === 1) {
            acc[key] = scores[key];
        }
        else if (brightId?.[key] === 1) {
            acc[key] = scores[key];
        }
        else {
            acc[key] = 0;
        }
        return acc;
    }, {});
    return cybilScores;
}
exports.strategy = strategy;
