"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.examples = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const examples_json_1 = __importDefault(require("./examples.json"));
exports.author = 'deversifi';
exports.version = '0.1.0';
exports.examples = examples_json_1.default;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const { api, token, limit = 300 } = options;
    const pages = Math.ceil(addresses.length / limit);
    const promises = [];
    let api_url = api;
    api_url += `?blockNumber=${snapshot}`;
    api_url += `&token=${token}`;
    Array.from(Array(pages)).forEach((x, i) => {
        const pageAddresses = addresses.slice(limit * i, limit * (i + 1));
        promises.push((0, cross_fetch_1.default)(`${api_url}&addresses=${pageAddresses.join('&addresses=')}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }));
    });
    const results = await Promise.all(promises);
    const resultsJson = await Promise.all(results.map((r) => r.json()));
    const data = resultsJson.reduce((res, item) => {
        if (item.score) {
            return [...res, ...item.score];
        }
        return res;
    }, []);
    return Object.fromEntries(data.map((value) => [value.address, parseFloat(value.score)]));
}
exports.strategy = strategy;
