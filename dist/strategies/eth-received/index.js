"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'mccallofthewild';
exports.version = '0.1.0';
async function strategy(...args) {
    const [, , , addresses, options] = args;
    const { coeff = 1, receivingAddresses } = options;
    // queries AnyBlock ElasticSearch https://www.anyblockanalytics.com/
    // Account: yidirel126@95ta.com Pass: xU5KKfys76wb633FvGS6
    const charitableTransactions = await (0, cross_fetch_1.default)('https://api.anyblock.tools/ethereum/ethereum/mainnet/es/tx/search/', {
        method: 'POST',
        body: JSON.stringify({
            from: 0,
            size: 10000,
            query: {
                bool: {
                    must: [
                        {
                            bool: {
                                should: [
                                    ...addresses.map((a) => ({
                                        match: {
                                            from: a
                                        }
                                    }))
                                ]
                            }
                        },
                        {
                            bool: {
                                should: [
                                    ...receivingAddresses.map((a) => ({
                                        match: {
                                            to: a
                                        }
                                    }))
                                ]
                            }
                        }
                    ]
                }
            }
        }),
        headers: {
            Authorization: 'Bearer 8c8b3826-afd5-4535-a8be-540562624fbe',
            'Content-Type': 'application/json'
        }
    })
        .then((r) => r.json())
        .catch((e) => {
        console.error('Eth-Received AnyBlock ElasticSearch Query Failed:');
        throw e;
    });
    const scores = {};
    for (const address of addresses) {
        scores[address] = charitableTransactions.hits.hits
            .filter((tx) => {
            const validAddress = tx._source.from.toLowerCase() == address.toLowerCase();
            return validAddress;
        })
            .reduce((prev, curr) => {
            return prev + curr._source.value.eth * coeff;
        }, 0);
    }
    return scores;
}
exports.strategy = strategy;
