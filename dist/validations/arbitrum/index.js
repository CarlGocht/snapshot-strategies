"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = __importDefault(require("../validation"));
const utils_1 = require("../../utils");
const utils_2 = require("../../utils");
const units_1 = require("@ethersproject/units");
const abi = [
    'function getVotes(address account) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
];
class default_1 extends validation_1.default {
    id = 'arbitrum';
    github = 'gzeoneth';
    version = '0.1.0';
    title = 'Arbitrum DAO Percentage of Votable Supply';
    description = 'Use with erc20-votes to validate by percentage of votable supply.';
    proposalValidationOnly = true;
    async validate() {
        if (this.params.strategies?.length > 8)
            throw new Error(`Max number of strategies exceeded`);
        const minBps = this.params.minBps;
        const decimals = this.params.decimals;
        const excludeaddr = this.params.excludeaddr ?? '0x00000000000000000000000000000000000A4B86';
        if (minBps) {
            const scores = await (0, utils_1.getScoresDirect)(this.space, this.params.strategies, this.network, (0, utils_1.getProvider)(this.network), [this.author], this.snapshot || 'latest');
            const totalScore = scores
                .map((score) => Object.values(score).reduce((a, b) => a + b, 0))
                .reduce((a, b) => a + b, 0);
            const [[totalSupply], [excludedSupply]] = await (0, utils_2.multicall)(this.network, (0, utils_1.getProvider)(this.network), abi, [
                [this.params.address, 'totalSupply', []],
                [this.params.address, 'getVotes', [excludeaddr]]
            ], { blockTag: this.snapshot || 'latest' });
            const votableSupply = parseFloat((0, units_1.formatUnits)(totalSupply.sub(excludedSupply).toString(), decimals));
            const bpsOfVotable = (totalScore * 10000) / votableSupply;
            if (bpsOfVotable < minBps)
                return false;
        }
        return true;
    }
}
exports.default = default_1;
