"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'payvint';
exports.version = '2.0.0';
const abi = [
    'function getAndUpdateDelegatedAmount(address wallet) external returns (uint)',
    'function getEscrowAddress(address beneficiary) external view returns (address)'
];
const GRAPH_API_URL = 'https://api.thegraph.com/subgraphs/name/ministry-of-decentralization/skale-manager-subgraph';
function returnGraphParamsValidatorPower(snapshot, addresses) {
    const output = {
        delegations: {
            __args: {
                where: {
                    and: [
                        {
                            or: [{ state: 'DELEGATED' }]
                        },
                        {
                            holder_: {
                                id_not_in: addresses.map((address) => address.toLowerCase())
                            }
                        },
                        {
                            validator_: {
                                address_in: addresses.map((address) => address.toLowerCase())
                            }
                        }
                    ]
                },
                first: 1000
            },
            holder: {
                id: true
            },
            validator: {
                address: true
            },
            amount: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        output.delegations.__args.block = { number: snapshot };
    }
    return output;
}
function returnGraphParamsValidatorOnly(snapshot, addresses) {
    const output = {
        validators: {
            __args: {
                where: {
                    address_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000
            },
            address: true,
            currentDelegationAmount: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        output.validators.__args.block = { number: snapshot };
    }
    return output;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    const combinedAddresses = [...addresses];
    const votePower = {};
    if (!options.validatorOnly || options.validatorOnly === false) {
        addresses.forEach((address) => {
            multi.call(address, options.addressSKL, 'getAndUpdateDelegatedAmount', [
                address
            ]);
        });
        const resultAccounts = await multi.execute();
        const escrowAddressCallsQuery = addresses.map((address) => [
            options.addressAllocator,
            'getEscrowAddress',
            [address]
        ]);
        const escrowAddressesFromAccount = await (0, utils_1.multicall)(network, provider, abi, [...escrowAddressCallsQuery], {
            blockTag
        });
        escrowAddressesFromAccount.forEach((obj) => {
            if (obj[0] !== '0x0000000000000000000000000000000000000000') {
                combinedAddresses.push(obj[0]);
            }
        });
        const addressToEscrow = new Map();
        addresses.forEach((address, index) => {
            addressToEscrow[address] = escrowAddressesFromAccount[index][0];
        });
        addresses.forEach((address) => {
            multi.call(address, options.addressSKL, 'getAndUpdateDelegatedAmount', [
                addressToEscrow[address]
            ]);
        });
        const resultEscrows = await multi.execute();
        Object.keys(resultAccounts).forEach((address) => {
            votePower[address] = parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(resultAccounts[address]).add(bignumber_1.BigNumber.from(resultEscrows[address]))));
        });
    }
    if (options.validatorPower !== false && !options.validatorOnly) {
        const results = await (0, utils_1.subgraphRequest)(GRAPH_API_URL, returnGraphParamsValidatorPower(blockTag, combinedAddresses));
        const validatorsVotePower = new Map();
        results.delegations.forEach((delegation) => {
            if (!validatorsVotePower[(0, address_1.getAddress)(delegation.validator.address)]) {
                validatorsVotePower[(0, address_1.getAddress)(delegation.validator.address)] =
                    bignumber_1.BigNumber.from(0);
            }
            validatorsVotePower[(0, address_1.getAddress)(delegation.validator.address)] =
                bignumber_1.BigNumber.from(validatorsVotePower[(0, address_1.getAddress)(delegation.validator.address)]).add(bignumber_1.BigNumber.from(delegation.amount));
        });
        Object.keys(validatorsVotePower).forEach((address) => {
            if (!votePower[address])
                votePower[address] = 0;
            votePower[address] += parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(validatorsVotePower[address])));
        });
    }
    else if (options.validatorOnly) {
        const results = await (0, utils_1.subgraphRequest)(GRAPH_API_URL, returnGraphParamsValidatorOnly(blockTag, combinedAddresses));
        const validatorsVotePower = new Map();
        results.validators.forEach((validator) => {
            if (!validatorsVotePower[(0, address_1.getAddress)(validator.address)]) {
                validatorsVotePower[(0, address_1.getAddress)(validator.address)] = bignumber_1.BigNumber.from(0);
            }
            validatorsVotePower[(0, address_1.getAddress)(validator.address)] = bignumber_1.BigNumber.from(validatorsVotePower[(0, address_1.getAddress)(validator.address)]).add(bignumber_1.BigNumber.from(validator.currentDelegationAmount));
        });
        Object.keys(validatorsVotePower).forEach((address) => {
            if (!votePower[address])
                votePower[address] = 0;
            votePower[address] += parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(validatorsVotePower[address])));
        });
    }
    return votePower;
}
exports.strategy = strategy;
