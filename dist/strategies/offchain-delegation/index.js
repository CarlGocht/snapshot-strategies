"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'bonustrack';
exports.version = '0.1.0';
exports.dependOnOtherAddress = true;
const DEFAULT_SPREADSHEET_ID = '2PACX-1vQsn8e6KQOwqfHoA4rWDke63jTwfcshHxcZwOzVharOoAARWy6aX0TvN-uzzgtmAn3F5vDbuDKnk5Jw';
const DEFAULT_GID = '506976679';
function csvToJson(csv) {
    const lines = csv.split('\n');
    const keys = lines[0].split(',').map((key) => key.trim());
    return lines.slice(1).map((line) => line.split(',').reduce((acc, cur, i) => {
        const toAdd = {};
        toAdd[keys[i]] = cur.trim();
        return { ...acc, ...toAdd };
    }, {}));
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const block = await provider.getBlock(snapshot);
    const ts = block.timestamp;
    const SPREADSHEET_ID = options.sheetId ?? DEFAULT_SPREADSHEET_ID;
    const GID = options.gid ?? DEFAULT_GID;
    const url = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?gid=${GID}&single=true&output=csv`;
    const res = await (0, cross_fetch_1.default)(url);
    const text = await res.text();
    const csv = csvToJson(text) || [];
    const delegations = Object.fromEntries(csv
        .map((item) => ({
        ...item,
        delegator: (0, address_1.getAddress)(item.delegator),
        delegate: (0, address_1.getAddress)(item.delegate),
        ts: parseInt(item.timestamp || '0')
    }))
        .filter((item) => item.ts <= ts && !addresses.includes(item.delegator))
        .sort((a, b) => a.ts - b.ts)
        .map((item) => [item.delegator, item.delegate]));
    const delegatorScores = await (0, utils_1.getScoresDirect)(space, options.strategies, network, provider, Object.keys(delegations), snapshot);
    const scores = {};
    delegatorScores.forEach((score) => {
        Object.entries(score).forEach(([address, vp]) => {
            if (delegations[address] && addresses.includes(delegations[address])) {
                if (!scores[delegations[address]])
                    scores[delegations[address]] = 0;
                scores[delegations[address]] += vp;
            }
        });
    });
    return scores;
}
exports.strategy = strategy;
