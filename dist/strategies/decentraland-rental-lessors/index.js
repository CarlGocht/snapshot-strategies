"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'fzavalia';
exports.version = '0.1.0';
const SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH = 500;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const scores = {};
    // Initialize scores for every provided address as 0
    for (const address of addresses) {
        scores[(0, address_1.getAddress)(address)] = 0;
    }
    // For the provided addresses, fetch all their Lands and Estates that have been transferred to the rentals contract.
    const rentalLandsAndEstates = await fetchLandsAndEstatesInRentalsContract(addresses, options, snapshot);
    const rentalLands = [];
    const rentalEstates = [];
    // Separate the assets into Lands and Estates
    for (const rentalLandOrEstate of rentalLandsAndEstates) {
        switch (rentalLandOrEstate.contractAddress) {
            case options.addresses.land.toLowerCase():
                rentalLands.push(rentalLandOrEstate);
                break;
            case options.addresses.estate.toLowerCase():
                rentalEstates.push(rentalLandOrEstate);
        }
    }
    // For each Land, increase the score of the original owner by the land multiplier.
    for (const land of rentalLands) {
        scores[(0, address_1.getAddress)(land.lessor)] += options.multipliers.land;
    }
    // Fetch and match Estates from the marketplace subgraph with the ones from the rentals subgraph.
    const rentalAndMarketplaceEstates = await fetchMarketplaceEstatesForProvidedRentalAssets(rentalEstates, options, snapshot);
    // For each Estate, increase the score of the original owner by the size of the estate times the multiplier.
    for (const [rentalEstate, marketplaceEstate] of rentalAndMarketplaceEstates) {
        scores[(0, address_1.getAddress)(rentalEstate.lessor)] +=
            marketplaceEstate.size * options.multipliers.estateSize;
    }
    return scores;
}
exports.strategy = strategy;
// For a given list of addresses, fetch all the lands and estates that belonged to them before being transferred to the Rentals contract.
async function fetchLandsAndEstatesInRentalsContract(addresses, options, snapshot) {
    // Separate the addresses in batches to optimize the subgraph query.
    const addressBatches = batchify(addresses, SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH);
    let finalRentalLandsAndEstates = [];
    for (const addressBatch of addressBatches) {
        const query = {
            rentalAssets: {
                __args: {
                    where: {
                        contractAddress_in: [
                            options.addresses.estate.toLowerCase(),
                            options.addresses.land.toLowerCase()
                        ],
                        lessor_in: addressBatch.map((address) => address.toLowerCase()),
                        isClaimed: false
                    },
                    first: 1000,
                    skip: 0
                },
                id: true,
                contractAddress: true,
                tokenId: true,
                lessor: true
            }
        };
        // If a snapshot is provided, use it as another filter of the query.
        if (typeof snapshot === 'number') {
            query.rentalAssets.__args.block = { number: snapshot };
        }
        let hasMoreResults = true;
        while (hasMoreResults) {
            const result = await (0, utils_1.subgraphRequest)(options.subgraphs.rentals, query);
            const rentalLandsAndEstates = result.rentalAssets;
            // If the received length matches the requested length, there might be more results.
            hasMoreResults =
                rentalLandsAndEstates.length === query.rentalAssets.__args.first;
            // If there are more results, skip the ones we already have on the next query.
            query.rentalAssets.__args.skip += query.rentalAssets.__args.first;
            finalRentalLandsAndEstates = [
                ...finalRentalLandsAndEstates,
                ...rentalLandsAndEstates
            ];
        }
    }
    return finalRentalLandsAndEstates;
}
// For a given list of estates obtained from the rentals subgraph, fetch the estates that correspond to them in the marketplace subgraph.
async function fetchMarketplaceEstatesForProvidedRentalAssets(rentalEstates, options, snapshot) {
    const rentalEstatesTokenIds = [];
    // Keep a map of rental estates to optimize the lookup later.
    const rentalEstatesByTokenId = new Map();
    for (const rentalEstate of rentalEstates) {
        const tokenId = rentalEstate.tokenId;
        rentalEstatesTokenIds.push(tokenId);
        rentalEstatesByTokenId.set(tokenId, rentalEstate);
    }
    // Separate the estate token ids in batches to optimize the subgraph query.
    const rentalEstateTokenIdBatches = batchify(rentalEstatesTokenIds, SUBGRAPH_QUERY_IN_FILTER_MAX_LENGTH);
    const rentalAndMarketplaceEstates = [];
    for (const rentalEstateTokenIdBatch of rentalEstateTokenIdBatches) {
        const query = {
            estates: {
                __args: {
                    where: {
                        tokenId_in: rentalEstateTokenIdBatch,
                        size_gt: 0
                    },
                    first: 1000,
                    skip: 0
                },
                tokenId: true,
                size: true
            }
        };
        // If a snapshot is provided, use it as another filter of the query.
        if (typeof snapshot === 'number') {
            query.estates.__args.block = { number: snapshot };
        }
        let hasMoreResults = true;
        while (hasMoreResults) {
            const result = await (0, utils_1.subgraphRequest)(options.subgraphs.marketplace, query);
            const marketplaceEstates = result.estates;
            // If the received length matches the requested length, there might be more results.
            hasMoreResults = marketplaceEstates.length === query.estates.__args.first;
            // If there are more results, skip the ones we already have on the next query.
            query.estates.__args.skip += query.estates.__args.first;
            for (const marketplaceEstate of marketplaceEstates) {
                const rentalEstate = rentalEstatesByTokenId.get(marketplaceEstate.tokenId);
                if (rentalEstate) {
                    rentalAndMarketplaceEstates.push([rentalEstate, marketplaceEstate]);
                }
            }
        }
    }
    return rentalAndMarketplaceEstates;
}
function batchify(elements, batchSize) {
    const batches = [];
    for (let i = 0; i < elements.length; i++) {
        if (i % batchSize === 0) {
            batches.push([]);
        }
        batches[batches.length - 1].push(elements[i]);
    }
    return batches;
}
