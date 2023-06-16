"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = __importDefault(require("../validation"));
const utils_1 = require("../../utils");
class default_1 extends validation_1.default {
    id = 'basic';
    github = 'bonustrack';
    version = '0.2.0';
    title = 'Basic';
    description = 'Use any strategy to determine if a user can vote.';
    async validate() {
        if (this.params.strategies?.length > 8)
            throw new Error(`Max number of strategies exceeded`);
        const minScore = this.params.minScore;
        if (minScore) {
            const scores = await (0, utils_1.getScoresDirect)(this.space, this.params.strategies, this.network, (0, utils_1.getProvider)(this.network), [this.author], this.snapshot || 'latest');
            const totalScore = scores
                .map((score) => Object.values(score).reduce((a, b) => a + b, 0))
                .reduce((a, b) => a + b, 0);
            if (totalScore < minScore)
                return false;
        }
        return true;
    }
}
exports.default = default_1;
