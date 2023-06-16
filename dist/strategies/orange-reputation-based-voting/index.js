"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'orange-protocol';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const query = `{
    getBasedVotingStrategy(
      addrs: ${JSON.stringify(addresses)},
      space: "${space}",
      snapshot: "${snapshot}",
      network: "${network}",
      options: { address: "${options.address}", symbol: "${options.symbol}" }
    )
    { address score }
  }`;
    const data = {
        operationName: '',
        query,
        variables: {}
    };
    const rawResponse = await (0, cross_fetch_1.default)('https://api.orangeprotocol.io/orange2c/query', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const content = await rawResponse.json();
    const list = content.data.getBasedVotingStrategy;
    return Object.fromEntries(list.map((item) => [item.address, item.score]));
}
exports.strategy = strategy;
