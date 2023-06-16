"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = '0xAurelius';
exports.version = '0.0.1';
const abi = ['function index() public view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('index', options.indexAddress, 'index');
    const result = await multi.execute();
    const index = parseFloat((0, units_1.formatUnits)(result.index, options.indexDecimals));
    const scores = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(scores).map((score) => [score[0], score[1] * index]));
}
exports.strategy = strategy;
