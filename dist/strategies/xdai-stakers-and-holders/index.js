"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'maxaleks';
exports.version = '0.1.0';
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/maxaleks/xdai-stakers';
async function getUsers(addresses, snapshot, userType) {
    const params = {
        [userType]: {
            __args: {
                where: {
                    address_in: addresses.map((address) => address.toLowerCase()),
                    balance_gt: 0
                },
                first: 1000,
                skip: 0
            },
            address: true,
            balance: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params[userType].__args.block = { number: snapshot };
    }
    let page = 0;
    let users = [];
    while (true) {
        params[userType].__args.skip = page * 1000;
        const data = await (0, utils_1.subgraphRequest)(SUBGRAPH_URL, params);
        users = users.concat(data[userType]);
        page++;
        if (data[userType].length < 1000)
            break;
    }
    return users;
}
const getXdaiBlockNumber = async (timestamp) => (0, cross_fetch_1.default)(`https://blockscout.com/xdai/mainnet/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`)
    .then((r) => r.json())
    .then((r) => Number(r.result.blockNumber));
async function strategy(space, network, provider, addresses, options, snapshot) {
    let xdaiSnapshot = 'latest';
    if (snapshot !== 'latest') {
        const { timestamp } = await provider.getBlock(snapshot);
        xdaiSnapshot = await getXdaiBlockNumber(timestamp);
    }
    const users = await getUsers(addresses, xdaiSnapshot, options.userType);
    const result = {};
    addresses.forEach((address) => {
        result[address] = 0;
    });
    if (!users || users.length === 0) {
        return result;
    }
    return Object.fromEntries(Object.entries(result).map(([address]) => {
        const user = users.find((item) => item.address.toLowerCase() === address.toLowerCase());
        let balance = 0;
        if (user) {
            balance = parseFloat((0, units_1.formatUnits)(user.balance, options.decimals));
        }
        return [address, balance];
    }));
}
exports.strategy = strategy;
