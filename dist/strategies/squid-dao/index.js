"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'zencephalon';
exports.version = '0.0.0';
const vewsSquidContractAddress = '0x58807e624b9953c2279e0efae5edcf9c7da08c7b';
const nftContractAddress = '0x7136ca86129e178399b703932464df8872f9a57a';
const sSquidContractAdress = '0x9d49bfc921f36448234b0efa67b5f91b3c691515';
const vewsSquidContractAbi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function supply() external view returns (uint256)'
];
const nftContractAbi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
const sSquidContractAbi = ['function index() external view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const callIndex = () => {
        return (0, utils_1.call)(provider, sSquidContractAbi, [
            sSquidContractAdress,
            'index',
            []
        ]);
    };
    const callNftSupply = () => {
        return (0, utils_1.call)(provider, nftContractAbi, [
            nftContractAddress,
            'totalSupply',
            []
        ]);
    };
    const callVewsSquidSupply = () => {
        return (0, utils_1.call)(provider, vewsSquidContractAbi, [
            vewsSquidContractAddress,
            'supply',
            []
        ]);
    };
    const makeMulticaller = (abi, contractAddress) => {
        const multiCaller = new utils_1.Multicaller(network, provider, abi, {
            blockTag
        });
        addresses.forEach((address) => multiCaller.call(address, contractAddress, 'balanceOf', [address]));
        return multiCaller;
    };
    const vewsSquidMulti = makeMulticaller(vewsSquidContractAbi, vewsSquidContractAddress);
    const nftMulti = makeMulticaller(nftContractAbi, nftContractAddress);
    const [index, nftSupply, vewsSquidSupply, vewsResults, nftResults] = await Promise.all([
        callIndex(),
        callNftSupply(),
        callVewsSquidSupply(),
        vewsSquidMulti.execute(),
        nftMulti.execute()
    ]);
    const scores = {};
    const nftMultiplier = bignumber_1.BigNumber.from(10).pow(18);
    for (const address of addresses) {
        const vewsScore = bignumber_1.BigNumber.from(vewsResults[address] || 0)
            .mul(index)
            .div(1e9);
        const nftScore = bignumber_1.BigNumber.from(nftResults[address] || 0).mul(nftMultiplier);
        scores[address] = vewsScore.add(nftScore);
    }
    const totalScore = nftSupply
        .mul(nftMultiplier)
        .add(vewsSquidSupply.mul(index).div(1e9));
    const dec_multi = bignumber_1.BigNumber.from(10).pow(options.decimals);
    return Object.fromEntries(Object.entries(scores).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance.mul(100).mul(dec_multi).div(totalScore), options.decimals))
    ]));
}
exports.strategy = strategy;
