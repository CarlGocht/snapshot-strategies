"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'gxmxni-hashflow';
exports.version = '0.1.0';
const STAKES_ABI = 'function stakes(address user) external returns (uint128 amount, uint64 lockExpiry)';
const BALANCE_OF_ABI = 'function balanceOf(address owner) external view returns (uint256 balance)';
const FOUR_YEARS_IN_SECONDS = 4 * 365 * 24 * 3_600;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { timestamp } = await provider.getBlock(blockTag);
    const stakes = await (0, utils_1.multicall)(network, provider, [STAKES_ABI], addresses.map((a) => [options.hftVault, 'stakes', [a]]), {
        blockTag
    });
    const rawVotingPower = stakes.map((s) => {
        const timestampBN = bignumber_1.BigNumber.from(timestamp);
        const timeUntilExpiry = (s[1].gt(timestampBN) ? s[1] : timestampBN).sub(timestampBN);
        return timeUntilExpiry.mul(s[0]).div(FOUR_YEARS_IN_SECONDS);
    });
    const nftBalances = await (0, utils_1.multicall)(network, provider, [BALANCE_OF_ABI], addresses.map((a) => [options.nftContract, 'balanceOf', [a]]), {
        blockTag
    });
    const votingPower = rawVotingPower.map((rvp, idx) => parseFloat((0, units_1.formatUnits)(rvp.mul(nftBalances[idx][0].gt(0) ? 110 : 100).div(100), 18)));
    return Object.fromEntries(addresses.map((a, idx) => [(0, address_1.getAddress)(a), votingPower[idx]]));
}
exports.strategy = strategy;
