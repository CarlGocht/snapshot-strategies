"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'bonustrack';
exports.version = '0.1.0';
exports.dependOnOtherAddress = false;
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
    const res = await (0, cross_fetch_1.default)(`https://docs.google.com/spreadsheets/d/e/${options.sheetId}/pub?gid=${options.gid || '0'}&single=true&output=csv`);
    const text = await res.text();
    const csv = (csvToJson(text) || []).map((item) => ({
        address: item.address,
        vp: parseFloat(item['voting power'] || '0'),
        ts: parseInt(item.timestamp || '0')
    }));
    return Object.fromEntries(addresses.map((address) => {
        const items = csv
            .filter((item) => item.address.toLowerCase() === address.toLowerCase() &&
            item.ts <= ts)
            .sort((a, b) => a.ts - b.ts);
        const vp = (items.pop() || {}).vp || 0;
        return [address, vp];
    }));
}
exports.strategy = strategy;
