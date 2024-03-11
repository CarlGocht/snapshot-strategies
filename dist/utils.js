"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNAPSHOT_SUBGRAPH_URL = exports.getSnapshots = exports.getProvider = exports.getBlockNumber = exports.getDelegatesBySpace = exports.call = exports.ipfsGet = exports.subgraphRequest = exports.Multicaller = exports.multicall = exports.customFetch = exports.getScoresDirect = exports.sha256 = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const strategies_1 = __importDefault(require("./strategies"));
const snapshot_js_1 = __importDefault(require("@snapshot-labs/snapshot.js"));
const delegation_1 = require("./utils/delegation");
const vp_1 = require("./utils/vp");
const crypto_1 = require("crypto");
function sha256(str) {
    return (0, crypto_1.createHash)('sha256').update(str).digest('hex');
}
exports.sha256 = sha256;
async function callStrategy(space, network, addresses, strategy, snapshot) {
    if ((snapshot !== 'latest' && strategy.params?.start > snapshot) ||
        (strategy.params?.end &&
            (snapshot === 'latest' || snapshot > strategy.params?.end)))
        return {};
    if (!strategies_1.default.hasOwnProperty(strategy.name)) {
        throw new Error(`Invalid strategy: ${strategy.name}`);
    }
    const score = await strategies_1.default[strategy.name].strategy(space, network, (0, exports.getProvider)(network), addresses, strategy.params, snapshot);
    const addressesLc = addresses.map((address) => address.toLowerCase());
    return Object.fromEntries(Object.entries(score).filter(([address, vp]) => vp > 0 && addressesLc.includes(address.toLowerCase())));
}
async function getScoresDirect(space, strategies, network, provider, addresses, snapshot = 'latest') {
    try {
        const networks = strategies.map((s) => s.network || network);
        const snapshots = await (0, exports.getSnapshots)(network, snapshot, provider, networks);
        // @ts-ignore
        if (addresses.length === 0)
            return strategies.map(() => ({}));
        return await Promise.all(strategies.map((strategy) => callStrategy(space, strategy.network || network, addresses, strategy, snapshots[strategy.network || network])));
    }
    catch (e) {
        return Promise.reject(e);
    }
}
exports.getScoresDirect = getScoresDirect;
function customFetch(url, options, timeout = 20000) {
    return Promise.race([
        (0, cross_fetch_1.default)(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('API request timeout')), timeout))
    ]);
}
exports.customFetch = customFetch;
_a = snapshot_js_1.default.utils, exports.multicall = _a.multicall, exports.Multicaller = _a.Multicaller, exports.subgraphRequest = _a.subgraphRequest, exports.ipfsGet = _a.ipfsGet, exports.call = _a.call, exports.getDelegatesBySpace = _a.getDelegatesBySpace, exports.getBlockNumber = _a.getBlockNumber, exports.getProvider = _a.getProvider, exports.getSnapshots = _a.getSnapshots, exports.SNAPSHOT_SUBGRAPH_URL = _a.SNAPSHOT_SUBGRAPH_URL;
exports.default = {
    getScoresDirect,
    multicall: exports.multicall,
    Multicaller: exports.Multicaller,
    subgraphRequest: exports.subgraphRequest,
    ipfsGet: exports.ipfsGet,
    call: exports.call,
    getDelegatesBySpace: exports.getDelegatesBySpace,
    getBlockNumber: exports.getBlockNumber,
    getProvider: exports.getProvider,
    getDelegations: delegation_1.getDelegations,
    getSnapshots: exports.getSnapshots,
    SNAPSHOT_SUBGRAPH_URL: exports.SNAPSHOT_SUBGRAPH_URL,
    getVp: vp_1.getVp,
    getCoreDelegations: vp_1.getDelegations
};
