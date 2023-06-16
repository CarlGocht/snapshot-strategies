"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const validation_1 = __importDefault(require("../validation"));
const snapshot_js_1 = __importDefault(require("@snapshot-labs/snapshot.js"));
const API_KEY = process.env.PASSPORT_API_KEY || '0cErnp4F.nRDEUU4Z8y5YyxcU32swrggDFNfWtXtI';
const headers = API_KEY
    ? {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }
    : undefined;
const GET_PASSPORT_STAMPS_URI = `https://api.scorer.gitcoin.co/registry/stamps/`;
function hasValidIssuanceAndExpiration(credential, proposalTs) {
    const issuanceDate = Number(new Date(credential.issuanceDate).getTime() / 1000).toFixed(0);
    const expirationDate = Number(new Date(credential.expirationDate).getTime() / 1000).toFixed(0);
    if (issuanceDate <= proposalTs && expirationDate >= proposalTs) {
        return true;
    }
    return false;
}
class default_1 extends validation_1.default {
    id = 'passport-gated';
    github = 'snapshot-labs';
    version = '0.1.0';
    title = 'Gitcoin Passport Gated';
    description = 'Protect your proposals from spam and vote manipulation by requiring users to have a Gitcoin Passport.';
    async validate(currentAddress = this.author) {
        const requiredStamps = this.params.stamps || [];
        const operator = this.params.operator;
        if (!operator)
            throw new Error('Operator is required');
        const stampsResponse = await (0, cross_fetch_1.default)(GET_PASSPORT_STAMPS_URI + currentAddress, { headers });
        const stampsData = await stampsResponse.json();
        if (!stampsData?.items) {
            // throw new Error(
            //   'You do not have a valid Gitcoin Passport. Create one by visiting https://passport.gitcoin.co/ '
            // );
            return false;
        }
        const provider = snapshot_js_1.default.utils.getProvider(this.network);
        const proposalTs = (await provider.getBlock(this.snapshot)).timestamp;
        // check expiration for all stamps
        const validStamps = stampsData.items
            .filter((stamp) => hasValidIssuanceAndExpiration(stamp.credential, proposalTs))
            .map((stamp) => stamp.credential.credentialSubject.provider);
        if (operator === 'AND') {
            return requiredStamps.every((stamp) => validStamps.includes(stamp));
        }
        else if (operator === 'OR') {
            return requiredStamps.some((stamp) => validStamps.includes(stamp));
        }
        return false;
    }
}
exports.default = default_1;
