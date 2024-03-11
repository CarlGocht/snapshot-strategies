"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const urbitGalaxies = __importStar(require("./urbit-galaxies/index"));
const ecoVotingPower = __importStar(require("./eco-voting-power"));
const dpsNFTStrategy = __importStar(require("./dps-nft-strategy"));
const dpsNFTStrategyNova = __importStar(require("./dps-nft-strategy-nova"));
const nounsPower = __importStar(require("./nouns-rfp-power"));
const erc20Votes = __importStar(require("./erc20-votes"));
const erc20VotesWithOverride = __importStar(require("./erc20-votes-with-override"));
const antiWhale = __importStar(require("./anti-whale"));
const balancer = __importStar(require("./balancer"));
const balancerSmartPool = __importStar(require("./balancer-smart-pool"));
const contractCall = __importStar(require("./contract-call"));
const dfynFarms = __importStar(require("./dfyn-staked-in-farms"));
const dfynVaults = __importStar(require("./dfyn-staked-in-vaults"));
const vDfynVault = __importStar(require("./balance-in-vdfyn-vault"));
const ensDomainsOwned = __importStar(require("./ens-domains-owned"));
const ensReverseRecord = __importStar(require("./ens-reverse-record"));
const ens10kClub = __importStar(require("./ens-10k-club"));
const ensAllClubDigits = __importStar(require("./ens-all-club-digits"));
const governorDelegator = __importStar(require("./governor-delegator"));
const erc20BalanceOf = __importStar(require("./erc20-balance-of"));
const erc20BalanceOfAt = __importStar(require("./erc20-balance-of-at"));
const erc20BalanceOfCoeff = __importStar(require("./erc20-balance-of-coeff"));
const erc20BalanceOfFixedTotal = __importStar(require("./erc20-balance-of-fixed-total"));
const erc20BalanceOfCv = __importStar(require("./erc20-balance-of-cv"));
const erc20WithBalance = __importStar(require("./erc20-with-balance"));
const erc20BalanceOfDelegation = __importStar(require("./erc20-balance-of-delegation"));
const erc20BalanceOfWithDelegation = __importStar(require("./erc20-balance-of-with-delegation"));
const erc20BalanceOfQuadraticDelegation = __importStar(require("./erc20-balance-of-quadratic-delegation"));
const erc20BalanceOfTopHolders = __importStar(require("./erc20-balance-of-top-holders"));
const erc20BalanceOfWeighted = __importStar(require("./erc20-balance-of-weighted"));
const ethalendBalanceOf = __importStar(require("./ethalend-balance-of"));
const prepoVesting = __importStar(require("./prepo-vesting"));
const erc20BalanceOfIndexed = __importStar(require("./erc20-balance-of-indexed"));
const revest = __importStar(require("./revest"));
const erc20Price = __importStar(require("./erc20-price"));
const balanceOfWithMin = __importStar(require("./balance-of-with-min"));
const balanceOfWithThresholds = __importStar(require("./balance-of-with-thresholds"));
const balanceOfWithLinearVestingPower = __importStar(require("./balance-of-with-linear-vesting-power"));
const linearVestingPower = __importStar(require("./linear-vesting-power"));
const thresholds = __importStar(require("./thresholds"));
const ethBalance = __importStar(require("./eth-balance"));
const ethWithBalance = __importStar(require("./eth-with-balance"));
const ethWalletAge = __importStar(require("./eth-wallet-age"));
const multichain = __importStar(require("./multichain"));
const gooddollarMultichain = __importStar(require("./gooddollar-multichain"));
const makerDsChief = __importStar(require("./maker-ds-chief"));
const uni = __importStar(require("./uni"));
const yearnVault = __importStar(require("./yearn-vault"));
const fraxFinance = __importStar(require("./frax-finance"));
const moloch = __importStar(require("./moloch"));
const uniswap = __importStar(require("./uniswap"));
const faralandStaking = __importStar(require("./faraland-staking"));
const flashstake = __importStar(require("./flashstake"));
const pancake = __importStar(require("./pancake"));
const pancakeProfile = __importStar(require("./pancake-profile"));
const synthetix = __importStar(require("./synthetix"));
const aelinCouncil = __importStar(require("./aelin-council"));
const ctoken = __importStar(require("./ctoken"));
const stakedUniswap = __importStar(require("./staked-uniswap"));
const erc20Received = __importStar(require("./erc20-received"));
const xDaiEasyStaking = __importStar(require("./xdai-easy-staking"));
const xDaiPOSDAOStaking = __importStar(require("./xdai-posdao-staking"));
const xDaiStakeHolders = __importStar(require("./xdai-stake-holders"));
const xDaiStakeDelegation = __importStar(require("./xdai-stake-delegation"));
const defidollar = __importStar(require("./defidollar"));
const aavegotchi = __importStar(require("./aavegotchi"));
const aavegotchiAgip = __importStar(require("./aavegotchi-agip"));
const mithcash = __importStar(require("./mithcash"));
const dittomoney = __importStar(require("./dittomoney"));
const balancerUnipool = __importStar(require("./balancer-unipool"));
const sushiswap = __importStar(require("./sushiswap"));
const masterchef = __importStar(require("./masterchef"));
const stablexswap = __importStar(require("./stablexswap"));
const stakedKeep = __importStar(require("./staked-keep"));
const stakedDaomaker = __importStar(require("./staked-daomaker"));
const typhoon = __importStar(require("./typhoon"));
const delegation = __importStar(require("./delegation"));
const delegationWithCap = __importStar(require("./delegation-with-cap"));
const delegationWithOverrides = __importStar(require("./delegation-with-overrides"));
const withDelegation = __importStar(require("./with-delegation"));
const ticket = __importStar(require("./ticket"));
const work = __importStar(require("./work"));
const ticketValidity = __importStar(require("./ticket-validity"));
const validation = __importStar(require("./validation"));
const opium = __importStar(require("./opium"));
const ocean = __importStar(require("./ocean-marketplace"));
const theGraphBalance = __importStar(require("./the-graph-balance"));
const theGraphDelegation = __importStar(require("./the-graph-delegation"));
const theGraphIndexing = __importStar(require("./the-graph-indexing"));
const whitelist = __importStar(require("./whitelist"));
const whitelistWeighted = __importStar(require("./whitelist-weighted"));
const tokenlon = __importStar(require("./tokenlon"));
const pobHash = __importStar(require("./pob-hash"));
const erc1155BalanceOf = __importStar(require("./erc1155-balance-of"));
const erc1155BalanceOfCv = __importStar(require("./erc1155-balance-of-cv"));
const erc1155WithMultiplier = __importStar(require("./erc1155-with-multiplier"));
const compLikeVotes = __importStar(require("./comp-like-votes"));
const governorAlpha = __importStar(require("./governor-alpha"));
const pagination = __importStar(require("./pagination"));
const rulerStakedLP = __importStar(require("./ruler-staked-lp"));
const xcover = __importStar(require("./xcover"));
const niuStaked = __importStar(require("./niu-staked"));
const mushrooms = __importStar(require("./mushrooms"));
const curioCardsErc20Weighted = __importStar(require("./curio-cards-erc20-weighted"));
const saffronFinance = __importStar(require("./saffron-finance"));
const saffronFinanceV2 = __importStar(require("./saffron-finance-v2"));
const renNodes = __importStar(require("./ren-nodes"));
const reverseVotingEscrow = __importStar(require("./reverse-voting-escrow"));
const multisigOwners = __importStar(require("./multisig-owners"));
const trancheStaking = __importStar(require("./tranche-staking"));
const pepemon = __importStar(require("./pepemon"));
const erc1155AllBalancesOf = __importStar(require("./erc1155-all-balances-of"));
const trancheStakingLP = __importStar(require("./tranche-staking-lp"));
const masterchefPoolBalance = __importStar(require("./masterchef-pool-balance"));
const masterchefPoolBalancePrice = __importStar(require("./masterchef-pool-balance-price"));
const api = __importStar(require("./api"));
const apiPost = __importStar(require("./api-post"));
const apiV2 = __importStar(require("./api-v2"));
const xseen = __importStar(require("./xseen"));
const molochAll = __importStar(require("./moloch-all"));
const molochLoot = __importStar(require("./moloch-loot"));
const erc721Enumerable = __importStar(require("./erc721-enumerable"));
const erc721WithMultiplier = __importStar(require("./erc721-with-multiplier"));
const erc721WithTokenId = __importStar(require("./erc721-with-tokenid"));
const erc721WithTokenIdRangeWeights = __importStar(require("./erc721-with-tokenid-range-weights"));
const erc721WithTokenIdRangeWeightsSimple = __importStar(require("./erc721-with-tokenid-range-weights-simple"));
const erc721WithTokenIdWeighted = __importStar(require("./erc721-with-tokenid-weighted"));
const erc721WithMetadata = __importStar(require("./erc721-with-metadata"));
const erc721WithMetadataByOwnerOf = __importStar(require("./erc721-with-metadata-by-ownerof"));
const hoprUniLpFarm = __importStar(require("./hopr-uni-lp-farm"));
const erc721 = __importStar(require("./erc721"));
const erc721MultiRegistry = __importStar(require("./erc721-multi-registry"));
const apescape = __importStar(require("./apescape"));
const liftkitchen = __importStar(require("./liftkitchen"));
const decentralandEstateSize = __importStar(require("./decentraland-estate-size"));
const decentralandWearableRariry = __importStar(require("./decentraland-wearable-rarity"));
const decentralandRentalLessors = __importStar(require("./decentraland-rental-lessors"));
const iotexStakedBalance = __importStar(require("./iotex-staked-balance"));
const xrc20BalanceOf = __importStar(require("./xrc20-balance-of"));
const brightid = __importStar(require("./brightid"));
const inverseXINV = __importStar(require("./inverse-xinv"));
const modefi = __importStar(require("./modefi"));
const spookyswap = __importStar(require("./spookyswap"));
const glide = __importStar(require("./glide"));
const rnbwBalance = __importStar(require("./rnbw-balance"));
const celerSgnDelegation = __importStar(require("./celer-sgn-delegation"));
const infinityProtocolPools = __importStar(require("./infinityprotocol-liquidity-pools"));
const aaveGovernancePower = __importStar(require("./aave-governance-power"));
const cake = __importStar(require("./cake"));
const aks = __importStar(require("./aks"));
const impossibleFinance = __importStar(require("./impossible-finance"));
const immutableX = __importStar(require("./immutable-x"));
const ogn = __importStar(require("./ogn"));
const oolongswap = __importStar(require("./oolongswap"));
const zrxVotingPower = __importStar(require("./zrx-voting-power"));
const tombFinance = __importStar(require("./tomb-finance"));
const trancheStakingSLICE = __importStar(require("./tranche-staking-slice"));
const unipoolUniv2Lp = __importStar(require("./unipool-univ2-lp"));
const unipoolXSushi = __importStar(require("./unipool-xsushi"));
const taraxaDelegation = __importStar(require("./taraxa-delegation"));
const poap = __importStar(require("./poap"));
const poapWithWeight = __importStar(require("./poap-with-weight"));
const poapWithWeightV2 = __importStar(require("./poap-with-weight-v2"));
const uniswapV3 = __importStar(require("./uniswap-v3"));
const uniswapV3Staking = __importStar(require("./uniswap-v3-staking"));
const l2Deversifi = __importStar(require("./l2-deversifi"));
const vestedDeversifi = __importStar(require("./vested-deversifi"));
const biswap = __importStar(require("./biswap"));
const honeyswap = __importStar(require("./honeyswap"));
const eglVote = __importStar(require("./egl-vote"));
const mcnFarm = __importStar(require("./mcn-farm"));
const meebitsdao = __importStar(require("./meebitsdao"));
const membership = __importStar(require("./membership"));
const holdsTokens = __importStar(require("./holds-tokens"));
const crucibleERC20BalanceOf = __importStar(require("./crucible-erc20-balance-of"));
const erc20TokenAndLpWeighted = __importStar(require("./erc20-token-and-lp-weighted"));
const erc20TokenAndSingleLpWeighted = __importStar(require("./erc20-token-and-single-lp-weighted"));
const crucibleERC20TokenAndLpWeighted = __importStar(require("./crucible-erc20-token-and-lp-weighted"));
const hasrock = __importStar(require("./has-rock"));
const flexaCapacityStaking = __importStar(require("./flexa-capacity-staking"));
const sunriseGamingUniv2Lp = __importStar(require("./sunrisegaming-univ2-lp"));
const sunriseGamingStaking = __importStar(require("./sunrisegaming-staking"));
const singleStakingAutoCompoundBalanceOf = __importStar(require("./single-staking-autocompound-balanceof"));
const singleStakingPoolsBalanceOf = __importStar(require("./single-staking-pools-balanceof"));
const occStakeOf = __importStar(require("./occ-stake-of"));
const hoprBridgedBalance = __importStar(require("./hopr-bridged-balance"));
const hoprStakeAndBalanceQV = __importStar(require("./hopr-stake-and-balance-qv"));
const lootCharacterGuilds = __importStar(require("./loot-character-guilds"));
const compLikeVotesInclusive = __importStar(require("./comp-like-votes-inclusive"));
const mstable = __importStar(require("./mstable"));
const hashesVoting = __importStar(require("./hashes-voting"));
const hashflowVeHft = __importStar(require("./hashflow-vehft"));
const aavegotchiWagmiGuild = __importStar(require("./aavegotchi-wagmi-guild"));
const polisBalance = __importStar(require("./polis-balance"));
const techQuadraticRankedChoice = __importStar(require("./tech-quadratic-ranked-choice"));
const mutantCatsStakersAndHolders = __importStar(require("./mutant-cats-stakers-and-holders"));
const razorVoting = __importStar(require("./razor-network-voting"));
const mcbBalanceFromGraph = __importStar(require("./mcb-balance-from-graph"));
const colonyReputation = __importStar(require("./colony-reputation"));
const digitalaxMonaQuickswap = __importStar(require("./digitalax-mona-quickswap"));
const digitalaxGenesisContribution = __importStar(require("./digitalax-genesis-contribution"));
const digitalaxLPStakers = __importStar(require("./digitalax-lp-stakers"));
const digitalaxMonaStakersMatic = __importStar(require("./digitalax-mona-stakers-matic"));
const digitalaxLPStakersMatic = __importStar(require("./digitalax-lp-stakers-matic"));
const galaxyNftWithScore = __importStar(require("./galaxy-nft-with-score"));
const galxeLoyaltyPoints = __importStar(require("./galxe-loyalty-points"));
const gatenetTotalStaked = __importStar(require("./gatenet-total-staked"));
const vesper = __importStar(require("./vesper"));
const thales = __importStar(require("./thales"));
const bscMvb = __importStar(require("./bsc-mvb"));
const coinswap = __importStar(require("./coinswap"));
const dgenesis = __importStar(require("./dgenesis"));
const votePowerAndShare = __importStar(require("./vote-power-and-share"));
const math = __importStar(require("./math"));
const pushVotingPower = __importStar(require("./push-voting-power"));
const stakedPSPBalance = __importStar(require("./staked-psp-balance"));
const erc20BalanceOfContractMultiplier = __importStar(require("./erc20-balance-of-contract-multiplier"));
const juicebox = __importStar(require("./juicebox"));
const snetFarmers = __importStar(require("./snet-farmers"));
const snetStakers = __importStar(require("./snet-stakers"));
const snetLiquidityProviders = __importStar(require("./snet-liquidity-providers"));
const unstackedToadzAndStackedToadzStakers = __importStar(require("./unstackedtoadz-and-stackedtoadz-stakers"));
const oceanDAOBrightID = __importStar(require("./ocean-dao-brightid"));
const lydiaGovVault = __importStar(require("./lydia-gov-vault"));
const darkforestScore = __importStar(require("./darkforest-score"));
const orangeReputationBasedVoting = __importStar(require("./orange-reputation-based-voting"));
const orangeReputationNftBasedVoting = __importStar(require("./orange-reputation-nft-based-voting"));
const squidDao = __importStar(require("./squid-dao"));
const pathBalanceStakedAndLocked = __importStar(require("./path-balance-staked-and-locked"));
const bottoDao = __importStar(require("./botto-dao"));
const genart = __importStar(require("./genart"));
const erc721MultiRegistryWeighted = __importStar(require("./erc721-multi-registry-weighted"));
const balancerPoolid = __importStar(require("./balancer-poolid"));
const stakedBalancer = __importStar(require("./staked-balancer"));
const stakedUniswapModifiable = __importStar(require("./staked-uniswap-modifiable"));
const givethGnosisBalanceV2 = __importStar(require("./giveth-gnosis-balance-v2"));
const givethBalancerBalance = __importStar(require("./giveth-balancer-balance"));
const erc1155BalanceOfIds = __importStar(require("./erc1155-balance-of-ids"));
const erc1155BalanceOfIdsWeighted = __importStar(require("./erc1155-balance-of-ids-weighted"));
const erc1155weighted = __importStar(require("./erc1155-weighted-by-id"));
const stakersAndHolders = __importStar(require("./stakers-and-holders"));
const banksyDao = __importStar(require("./banksy-dao"));
const spacey2025 = __importStar(require("./spacey2025"));
const spacefiBlp = __importStar(require("./spacefi-blp"));
const sandmanDao = __importStar(require("./sandman-dao"));
const veBalanceOfAt = __importStar(require("./ve-balance-of-at"));
const veRibbon = __importStar(require("./ve-ribbon"));
const veRibbonVotingPower = __importStar(require("./ve-ribbon-voting-power"));
const chubbykaijudao = __importStar(require("./chubbykaijudao"));
const landDaoTiers = __importStar(require("./landdao-token-tiers"));
const defiplaza = __importStar(require("./defiplaza"));
const stakingClaimedUnclaimed = __importStar(require("./staking-claimed-unclaimed"));
const gysrStakingBalance = __importStar(require("./gysr-staking-balance"));
const gysrLPStakingBalance = __importStar(require("./gysr-lp-staking-balance"));
const wanakafarmStaking = __importStar(require("./wanakafarm-staking"));
const starsharks = __importStar(require("./starsharks"));
const printerFinancial = __importStar(require("./printer-financial"));
const ethercatsFoundersSeries = __importStar(require("./ethercats-founders-series"));
const potion = __importStar(require("./potion"));
const MinotaurMoney = __importStar(require("./minotaur-money"));
const convFinance = __importStar(require("./conv-finance"));
const sdBoost = __importStar(require("./sd-boost"));
const wanakafarmLandIngame = __importStar(require("./wanakafarm-land-ingame"));
const starcatchersTopWindow = __importStar(require("./starcatchers-top-window"));
const gno = __importStar(require("./gno"));
const masterchefPoolBalanceNoRewarddebt = __importStar(require("./masterchef-pool-balance-no-rewarddebt"));
const proofOfHumanity = __importStar(require("./proof-of-humanity"));
const samuraiLegendsGeneralsBalance = __importStar(require("./samurailegends-generals-balance"));
const dogsUnchained = __importStar(require("./dogs-unchained"));
const umamiVoting = __importStar(require("./umami-voting"));
const liquidityTokenProvide = __importStar(require("./liquidity-token-provide"));
const gamiumVoting = __importStar(require("./gamium-voting"));
const citydaoSquareRoot = __importStar(require("./citydao-square-root"));
const recusalList = __importStar(require("./recusal-list"));
const rowdyRoos = __importStar(require("./rowdy-roos"));
const ethermon721 = __importStar(require("./ethermon-erc721"));
const etherorcsComboBalanceOf = __importStar(require("./etherorcs-combo-balanceof"));
const hedgey = __importStar(require("./hedgey"));
const hedgeyDelegate = __importStar(require("./hedgey-delegate"));
const sybilProtection = __importStar(require("./sybil-protection"));
const veBalanceOfAtNFT = __importStar(require("./ve-balance-of-at-nft"));
const genzeesFromSubgraph = __importStar(require("./genzees-from-subgraph"));
const positionGovernancePower = __importStar(require("./position-governance-power"));
const creditLp = __importStar(require("./credit-lp"));
const helix = __importStar(require("./helix"));
const auraBalanceOfSingleAsset = __importStar(require("./aura-vault-balance-of-single-asset"));
const rocketpoolNodeOperator = __importStar(require("./rocketpool-node-operator"));
const rocketpoolNodeOperatorv2 = __importStar(require("./rocketpool-node-operator-v2"));
const rocketpoolNodeOperatorv3 = __importStar(require("./rocketpool-node-operator-v3"));
const earthfundChildDaoStakingBalance = __importStar(require("./earthfund-child-dao-staking-balance"));
const unipilotVaultPilotBalance = __importStar(require("./unipilot-vault-pilot-balance"));
const sdBoostTWAVP = __importStar(require("./sd-boost-twavp"));
const fortaShares = __importStar(require("./forta-shares"));
const lrcL2SubgraphBalanceOf = __importStar(require("./lrc-l2-subgraph-balance-of"));
const lrcL2NftBalanceOf = __importStar(require("./lrc-l2-nft-balance-of"));
const lrcLPSubgraphBalanceOf = __importStar(require("./lrc-lp-subgraph-balance-of"));
const lrcNFTmult = __importStar(require("./lrc-nft-search-mult"));
const bancorPoolTokenUnderlyingBalance = __importStar(require("./bancor-pool-token-underlying-balance"));
const balanceOfSubgraph = __importStar(require("./balance-of-subgraph"));
const wagdieSubgraph = __importStar(require("./wagdie-subgraph"));
const erc3525FlexibleVoucher = __importStar(require("./erc3525-flexible-voucher"));
const erc721PairWeights = __importStar(require("./erc721-pair-weights"));
const harmonyStaking = __importStar(require("./harmony-staking"));
const orcaPod = __importStar(require("./orca-pod"));
const metropolisPod = __importStar(require("./metropolis-pod"));
const proxyProtocolErc721BalanceOf = __importStar(require("./proxyprotocol-erc721-balance-of"));
const arrowVesting = __importStar(require("./arrow-vesting"));
const tutellusProtocol = __importStar(require("./tutellus-protocol"));
const fightClub = __importStar(require("./fight-club"));
const tproStaking = __importStar(require("./tpro-staking"));
const safeVested = __importStar(require("./safe-vested"));
const otterspaceBadges = __importStar(require("./otterspace-badges"));
const syntheticNounsClaimerOwner = __importStar(require("./synthetic-nouns-with-claimer"));
const echelonWalletPrimeAndCachedKey = __importStar(require("./echelon-wallet-prime-and-cached-key"));
const nation3VotesWIthDelegations = __importStar(require("./nation3-votes-with-delegations"));
const nation3CoopPassportWithDelegations = __importStar(require("./nation3-passport-coop-with-delegations"));
const posichainStaking = __importStar(require("./posichain-staking"));
const posichainTotalBalance = __importStar(require("./posichain-total-balance"));
const erc20TokensPerUni = __importStar(require("./erc20-tokens-per-uni"));
const bancorStandardRewardsUnderlyingBalance = __importStar(require("./bancor-standard-rewards-underlying-balance"));
const sdVoteBoost = __importStar(require("./sd-vote-boost"));
const sdVoteBoostTWAVP = __importStar(require("./sd-vote-boost-twavp"));
const ninechroniclesStakedAndDcc = __importStar(require("./ninechronicles-staked-and-dcc"));
const spreadsheet = __importStar(require("./spreadsheet"));
const offchainDelegation = __importStar(require("./offchain-delegation"));
const rep3Badges = __importStar(require("./rep3-badges"));
const marsecosystem = __importStar(require("./marsecosystem"));
const ari10StakingLocked = __importStar(require("./ari10-staking-locked"));
const skaleDelegationWeighted = __importStar(require("./skale-delegation-weighted"));
const reliquary = __importStar(require("./reliquary"));
const acrossStakedAcx = __importStar(require("./across-staked-acx"));
const lodestarVesting = __importStar(require("./lodestar-vesting"));
const lodestarStakedLp = __importStar(require("./lodestar-staked-lp"));
const jpegdLockedJpegOf = __importStar(require("./jpegd-locked-jpeg-of"));
const litDaoGovernance = __importStar(require("./lit-dao-governance"));
const battleflyVGFLYAndStakedGFLY = __importStar(require("./battlefly-vgfly-and-staked-gfly"));
const nexonArmyNFT = __importStar(require("./nexon-army-nft"));
const moonbeamFreeBalance = __importStar(require("./moonbeam-free-balance"));
const stakedotlinkVesting = __importStar(require("./stakedotlink-vesting"));
const pspInSePSP2Balance = __importStar(require("./psp-in-sepsp2-balance"));
const pdnBalancesAndVests = __importStar(require("./pdn-balances-and-vests"));
const izumiVeiZi = __importStar(require("./izumi-veizi"));
const lqtyProxyStakers = __importStar(require("./lqty-proxy-stakers"));
const rdntCapitalVoting = __importStar(require("./rdnt-capital-voting"));
const stakedDefiBalance = __importStar(require("./staked-defi-balance"));
const degenzooErc721AnimalsWeighted = __importStar(require("./degenzoo-erc721-animals-weighted"));
const capVotingPower = __importStar(require("./cap-voting-power"));
const zunamiPoolGaugeAggregatedBalanceOf = __importStar(require("./zunami-pool-gauge-aggregated-balance-of"));
const erc721CollateralHeld = __importStar(require("./erc721-collateral-held"));
const starlayVeBalanceOfLockerId = __importStar(require("./starlay-ve-balance-of-locker-id"));
const winrStaking = __importStar(require("./winr-staking"));
const spaceid = __importStar(require("./spaceid"));
const delegateRegistryV2 = __importStar(require("./delegate-registry-v2"));
const hatsProtocolSingleVotePerOrg = __importStar(require("./hats-protocol-single-vote-per-org"));
const karmaDiscordRoles = __importStar(require("./karma-discord-roles"));
const seedifyHoldStakingFarming = __importStar(require("./seedify-cumulative-voting-power-hodl-staking-farming"));
const stakedMoreKudasai = __importStar(require("./staked-morekudasai"));
const sablierV1Deposit = __importStar(require("./sablier-v1-deposit"));
const sablierV2 = __importStar(require("./sablier-v2"));
const gelatoStaking = __importStar(require("./gelato-staking"));
const erc4626AssetsOf = __importStar(require("./erc4626-assets-of"));
const sdVoteBoostTWAVPV2 = __importStar(require("./sd-vote-boost-twavp-v2"));
const sdVoteBoostTWAVPV3 = __importStar(require("./sd-vote-boost-twavp-v3"));
const sdVoteBoostTWAVPV4 = __importStar(require("./sd-vote-boost-twavp-v4"));
const sdVoteBoostTWAVPVsdToken = __importStar(require("./sd-vote-boost-twavp-vsdtoken"));
const sdVoteBoostTWAVPBalanceof = __importStar(require("./sd-vote-boost-twavp-balanceof"));
const friendTech = __importStar(require("./friend-tech"));
const moonbase = __importStar(require("./moonbase"));
const dssVestUnpaid = __importStar(require("./dss-vest-unpaid"));
const dssVestBalanceAndUnpaid = __importStar(require("./dss-vest-balance-and-unpaid"));
const eoaBalanceAndStakingPools = __importStar(require("./eoa-balance-and-staking-pools"));
const stationScoreIfBadge = __importStar(require("./station-score-if-badge"));
const stationConstantIfBadge = __importStar(require("./station-constant-if-badge"));
const mangroveStationQVScaledToMGV = __importStar(require("./mangrove-station-qv-scaled-to-mgv"));
const floki = __importStar(require("./floki"));
const hatsProtocolHatId = __importStar(require("./hats-protocol-hat-id"));
const hatsProtocolHatIds = __importStar(require("./hats-protocol-hat-ids"));
const bubblegumKids = __importStar(require("./bubblegum-kids"));
const clipperStakedSail = __importStar(require("./clipper-staked-sail"));
const plearn = __importStar(require("./plearn"));
const snote = __importStar(require("./snote"));
const streamr = __importStar(require("./streamr"));
const aavegotchiAgip17 = __importStar(require("./aavegotchi-agip-17"));
const aavegotchiAgip37GltrStakedLp = __importStar(require("./aavegotchi-agip-37-gltr-staked-lp"));
const aavegotchiAgip37WapGhst = __importStar(require("./aavegotchi-agip-37-wap-ghst"));
const agave = __importStar(require("./agave"));
const arrakisFinance = __importStar(require("./arrakis-finance"));
const ctsiStakingPool = __importStar(require("./ctsi-staking-pool"));
const cyberkongzV2 = __importStar(require("./cyberkongz-v2"));
const dextfStakedInVaults = __importStar(require("./dextf-staked-in-vaults"));
const genomesdao = __importStar(require("./genomesdao"));
const goldfinchMembership = __importStar(require("./goldfinch-membership"));
const goldfinchVotingPower = __importStar(require("./goldfinch-voting-power"));
const h2o = __importStar(require("./h2o"));
const hoprStakingBySeason = __importStar(require("./hopr-staking-by-season"));
const hoprStakingS2 = __importStar(require("./hopr-staking-s2"));
const ilv = __importStar(require("./ilv"));
const meebitsdaoDelegation = __importStar(require("./meebitsdao-delegation"));
const modefiStaking = __importStar(require("./modefi-staking"));
const orbsNetworkDelegation = __importStar(require("./orbs-network-delegation"));
const planetFinanceV2 = __importStar(require("./planet-finance-v2"));
const rariFuse = __importStar(require("./rari-fuse"));
const synthetixNonQuadratic_1 = __importStar(require("./synthetix-non-quadratic_1"));
const synthetixQuadratic = __importStar(require("./synthetix-quadratic"));
const synthetixQuadratic_1 = __importStar(require("./synthetix-quadratic_1"));
const synthetix_1 = __importStar(require("./synthetix_1"));
const totalAxionShares = __importStar(require("./total-axion-shares"));
const unipoolSameToken = __importStar(require("./unipool-same-token"));
const vendorV2BorrowerCollateralBalanceOf = __importStar(require("./vendor-v2-borrower-collateral-balance-of"));
const voltVotingPower = __importStar(require("./volt-voting-power"));
const xdaiStakersAndHolders = __importStar(require("./xdai-stakers-and-holders"));
const minimeBalanceVsSupplyWeighted = __importStar(require("./minime-balance-vs-supply-weighted"));
const vestingBalanceOf = __importStar(require("./vesting-balance-of"));
const strategies = {
    'minime-balance-vs-supply-weighted': minimeBalanceVsSupplyWeighted,
    'cap-voting-power': capVotingPower,
    'izumi-veizi': izumiVeiZi,
    'eco-voting-power': ecoVotingPower,
    'forta-shares': fortaShares,
    'across-staked-acx': acrossStakedAcx,
    'ethermon-erc721': ethermon721,
    'etherorcs-combo-balanceof': etherorcsComboBalanceOf,
    'recusal-list': recusalList,
    'landdao-token-tiers': landDaoTiers,
    'giveth-balancer-balance': givethBalancerBalance,
    'giveth-gnosis-balance-v2': givethGnosisBalanceV2,
    'nouns-rfp-power': nounsPower,
    'anti-whale': antiWhale,
    balancer,
    'balancer-smart-pool': balancerSmartPool,
    'lit-dao-governance': litDaoGovernance,
    'balance-in-vdfyn-vault': vDfynVault,
    'erc20-received': erc20Received,
    'contract-call': contractCall,
    defiplaza: defiplaza,
    'dfyn-staked-in-farms': dfynFarms,
    'dfyn-staked-in-vaults': dfynVaults,
    'dps-nft-strategy': dpsNFTStrategy,
    'dps-nft-strategy-nova': dpsNFTStrategyNova,
    'ens-domains-owned': ensDomainsOwned,
    'ens-reverse-record': ensReverseRecord,
    'ens-10k-club': ens10kClub,
    'ens-all-club-digits': ensAllClubDigits,
    'governor-delegator': governorDelegator,
    'erc20-balance-of': erc20BalanceOf,
    'erc20-balance-of-at': erc20BalanceOfAt,
    'erc20-votes': erc20Votes,
    'erc20-votes-with-override': erc20VotesWithOverride,
    'erc721-multi-registry-weighted': erc721MultiRegistryWeighted,
    'erc20-balance-of-fixed-total': erc20BalanceOfFixedTotal,
    'erc20-balance-of-cv': erc20BalanceOfCv,
    'erc20-balance-of-coeff': erc20BalanceOfCoeff,
    'erc20-with-balance': erc20WithBalance,
    'erc20-balance-of-delegation': erc20BalanceOfDelegation,
    'erc20-balance-of-with-delegation': erc20BalanceOfWithDelegation,
    'erc20-balance-of-quadratic-delegation': erc20BalanceOfQuadraticDelegation,
    'erc20-balance-of-top-holders': erc20BalanceOfTopHolders,
    'erc20-balance-of-weighted': erc20BalanceOfWeighted,
    'erc20-balance-of-indexed': erc20BalanceOfIndexed,
    'erc20-price': erc20Price,
    'ethalend-balance-of': ethalendBalanceOf,
    'balance-of-with-min': balanceOfWithMin,
    'balance-of-with-thresholds': balanceOfWithThresholds,
    thresholds,
    'eth-balance': ethBalance,
    'eth-with-balance': ethWithBalance,
    'eth-wallet-age': ethWalletAge,
    'maker-ds-chief': makerDsChief,
    erc721,
    'erc721-enumerable': erc721Enumerable,
    'erc721-with-multiplier': erc721WithMultiplier,
    'erc721-with-tokenid': erc721WithTokenId,
    'erc721-with-tokenid-range-weights': erc721WithTokenIdRangeWeights,
    'erc721-with-tokenid-range-weights-simple': erc721WithTokenIdRangeWeightsSimple,
    'erc721-with-tokenid-weighted': erc721WithTokenIdWeighted,
    'erc721-with-metadata': erc721WithMetadata,
    'erc721-with-metadata-by-ownerof': erc721WithMetadataByOwnerOf,
    'erc721-multi-registry': erc721MultiRegistry,
    'erc1155-balance-of': erc1155BalanceOf,
    'erc1155-balance-of-cv': erc1155BalanceOfCv,
    'prepo-vesting': prepoVesting,
    multichain,
    'gooddollar-multichain': gooddollarMultichain,
    uni,
    'frax-finance': fraxFinance,
    'yearn-vault': yearnVault,
    moloch,
    masterchef,
    sushiswap,
    uniswap,
    'faraland-staking': faralandStaking,
    flashstake,
    pancake,
    'pancake-profile': pancakeProfile,
    synthetix,
    'aelin-council': aelinCouncil,
    ctoken,
    'staked-uniswap': stakedUniswap,
    'xdai-easy-staking': xDaiEasyStaking,
    'xdai-posdao-staking': xDaiPOSDAOStaking,
    'xdai-stake-holders': xDaiStakeHolders,
    'xdai-stake-delegation': xDaiStakeDelegation,
    defidollar,
    aavegotchi,
    'aavegotchi-agip': aavegotchiAgip,
    mithcash,
    stablexswap,
    dittomoney,
    'staked-keep': stakedKeep,
    'staked-daomaker': stakedDaomaker,
    'balancer-unipool': balancerUnipool,
    typhoon,
    delegation,
    'delegation-with-cap': delegationWithCap,
    'delegation-with-overrides': delegationWithOverrides,
    'with-delegation': withDelegation,
    ticket,
    work,
    'ticket-validity': ticketValidity,
    validation,
    opium,
    'ocean-marketplace': ocean,
    'the-graph-balance': theGraphBalance,
    'the-graph-delegation': theGraphDelegation,
    'the-graph-indexing': theGraphIndexing,
    whitelist,
    'whitelist-weighted': whitelistWeighted,
    tokenlon,
    'pob-hash': pobHash,
    'comp-like-votes': compLikeVotes,
    'governor-alpha': governorAlpha,
    pagination,
    'ruler-staked-lp': rulerStakedLP,
    xcover,
    'niu-staked': niuStaked,
    mushrooms: mushrooms,
    'curio-cards-erc20-weighted': curioCardsErc20Weighted,
    'ren-nodes': renNodes,
    'reverse-voting-escrow': reverseVotingEscrow,
    'multisig-owners': multisigOwners,
    'tranche-staking': trancheStaking,
    pepemon,
    'erc1155-all-balances-of': erc1155AllBalancesOf,
    'erc1155-with-multiplier': erc1155WithMultiplier,
    'saffron-finance': saffronFinance,
    'saffron-finance-v2': saffronFinanceV2,
    'tranche-staking-lp': trancheStakingLP,
    'masterchef-pool-balance': masterchefPoolBalance,
    'masterchef-pool-balance-price': masterchefPoolBalancePrice,
    api,
    'api-post': apiPost,
    'api-v2': apiV2,
    'api-v2-override': { ...apiV2 },
    xseen,
    'moloch-all': molochAll,
    'moloch-loot': molochLoot,
    'hopr-uni-lp-farm': hoprUniLpFarm,
    apescape,
    liftkitchen,
    'decentraland-estate-size': decentralandEstateSize,
    'decentraland-wearable-rarity': decentralandWearableRariry,
    'decentraland-rental-lessors': decentralandRentalLessors,
    brightid,
    'inverse-xinv': inverseXINV,
    modefi,
    'iotex-staked-balance': iotexStakedBalance,
    'xrc20-balance-of': xrc20BalanceOf,
    spookyswap,
    glide,
    'rnbw-balance': rnbwBalance,
    'celer-sgn-delegation': celerSgnDelegation,
    'infinityprotocol-liquidity-pools': infinityProtocolPools,
    'aave-governance-power': aaveGovernancePower,
    cake,
    aks,
    ogn,
    oolongswap,
    'impossible-finance': impossibleFinance,
    'immutable-x': immutableX,
    'zrx-voting-power': zrxVotingPower,
    'tomb-finance': tombFinance,
    'tranche-staking-slice': trancheStakingSLICE,
    'unipool-univ2-lp': unipoolUniv2Lp,
    'unipool-xsushi': unipoolXSushi,
    'taraxa-delegation': taraxaDelegation,
    poap: poap,
    'poap-with-weight': poapWithWeight,
    'poap-with-weight-v2': poapWithWeightV2,
    'uniswap-v3': uniswapV3,
    'uniswap-v3-staking': uniswapV3Staking,
    'l2-deversifi': l2Deversifi,
    'vested-deversifi': vestedDeversifi,
    biswap,
    honeyswap,
    'egl-vote': eglVote,
    'mcn-farm': mcnFarm,
    meebitsdao,
    'crucible-erc20-balance-of': crucibleERC20BalanceOf,
    'erc20-token-and-lp-weighted': erc20TokenAndLpWeighted,
    'erc20-token-and-single-lp-weighted': erc20TokenAndSingleLpWeighted,
    'crucible-erc20-token-and-lp-weighted': crucibleERC20TokenAndLpWeighted,
    'has-rock': hasrock,
    'flexa-capacity-staking': flexaCapacityStaking,
    'sunrisegaming-univ2-lp': sunriseGamingUniv2Lp,
    'sunrisegaming-staking': sunriseGamingStaking,
    'single-staking-autocompound-balanceof': singleStakingAutoCompoundBalanceOf,
    'single-staking-pools-balanceof': singleStakingPoolsBalanceOf,
    'hopr-stake-and-balance-qv': hoprStakeAndBalanceQV,
    'hopr-bridged-balance': hoprBridgedBalance,
    'occ-stake-of': occStakeOf,
    'holds-tokens': holdsTokens,
    'loot-character-guilds': lootCharacterGuilds,
    'comp-like-votes-inclusive': compLikeVotesInclusive,
    mstable,
    'hashes-voting': hashesVoting,
    'hashflow-vehft': hashflowVeHft,
    'aavegotchi-wagmi-guild': aavegotchiWagmiGuild,
    'polis-balance': polisBalance,
    'mutant-cats-stakers-and-holders': mutantCatsStakersAndHolders,
    'razor-network-voting': razorVoting,
    'mcb-balance-from-graph': mcbBalanceFromGraph,
    'digitalax-genesis-contribution': digitalaxGenesisContribution,
    'digitalax-lp-stakers': digitalaxLPStakers,
    'digitalax-mona-stakers-matic': digitalaxMonaStakersMatic,
    'digitalax-lp-stakers-matic': digitalaxLPStakersMatic,
    'colony-reputation': colonyReputation,
    'digitalax-mona-quickswap': digitalaxMonaQuickswap,
    'galaxy-nft-with-score': galaxyNftWithScore,
    'galxe-loyalty-points': galxeLoyaltyPoints,
    'gatenet-total-staked': gatenetTotalStaked,
    vesper,
    thales,
    'tech-quadratic-ranked-choice': techQuadraticRankedChoice,
    'bsc-mvb': bscMvb,
    coinswap,
    dgenesis,
    'vote-power-and-share': votePowerAndShare,
    math,
    'push-voting-power': pushVotingPower,
    'staked-psp-balance': stakedPSPBalance,
    'erc20-balance-of-contract-multiplier': erc20BalanceOfContractMultiplier,
    juicebox,
    'snet-farmers': snetFarmers,
    'snet-stakers': snetStakers,
    'snet-liquidity-providers': snetLiquidityProviders,
    'unstackedtoadz-and-stackedtoadz-stakers': unstackedToadzAndStackedToadzStakers,
    'ocean-dao-brightid': oceanDAOBrightID,
    membership: membership,
    'lydia-gov-vault': lydiaGovVault,
    'darkforest-score': darkforestScore,
    'orange-reputation-based-voting': orangeReputationBasedVoting,
    'orange-reputation-nft-based-voting': orangeReputationNftBasedVoting,
    'squid-dao': squidDao,
    'botto-dao': bottoDao,
    genart,
    'path-balance-staked-and-locked': pathBalanceStakedAndLocked,
    'balancer-poolid': balancerPoolid,
    'staked-balancer': stakedBalancer,
    'staked-uniswap-modifiable': stakedUniswapModifiable,
    'erc1155-balance-of-ids': erc1155BalanceOfIds,
    'erc1155-balance-of-ids-weighted': erc1155BalanceOfIdsWeighted,
    'erc1155-weighted-by-id': erc1155weighted,
    'stakers-and-holders': stakersAndHolders,
    'banksy-dao': banksyDao,
    spacey2025: spacey2025,
    'spacefi-blp': spacefiBlp,
    'sandman-dao': sandmanDao,
    've-balance-of-at': veBalanceOfAt,
    've-ribbon': veRibbon,
    've-ribbon-voting-power': veRibbonVotingPower,
    chubbykaijudao: chubbykaijudao,
    revest: revest,
    'staking-claimed-unclaimed': stakingClaimedUnclaimed,
    'gysr-staking-balance': gysrStakingBalance,
    'gysr-lp-staking-balance': gysrLPStakingBalance,
    'wanakafarm-staking': wanakafarmStaking,
    starsharks,
    'printer-financial': printerFinancial,
    'ethercats-founders-series': ethercatsFoundersSeries,
    potion,
    'minotaur-money': MinotaurMoney,
    'conv-finance': convFinance,
    'sd-boost': sdBoost,
    'wanakafarm-land-ingame': wanakafarmLandIngame,
    'starcatchers-top-window': starcatchersTopWindow,
    gno: gno,
    'gno-vote-weight': gno,
    'masterchef-pool-balance-no-rewarddebt': masterchefPoolBalanceNoRewarddebt,
    'proof-of-humanity': proofOfHumanity,
    'sybil-protection': sybilProtection,
    'samurailegends-generals-balance': samuraiLegendsGeneralsBalance,
    'dogs-unchained': dogsUnchained,
    'umami-voting': umamiVoting,
    'liquidity-token-provide': liquidityTokenProvide,
    'gamium-voting': gamiumVoting,
    'citydao-square-root': citydaoSquareRoot,
    'rowdy-roos': rowdyRoos,
    hedgey,
    'hedgey-delegate': hedgeyDelegate,
    've-balance-of-at-nft': veBalanceOfAtNFT,
    'genzees-from-subgraph': genzeesFromSubgraph,
    'position-governance-power': positionGovernancePower,
    'credit-lp': creditLp,
    helix,
    'aura-vault-balance-of-single-asset': auraBalanceOfSingleAsset,
    'rocketpool-node-operator': rocketpoolNodeOperator,
    'rocketpool-node-operator-v2': rocketpoolNodeOperatorv2,
    'rocketpool-node-operator-v3': rocketpoolNodeOperatorv3,
    'earthfund-child-dao-staking-balance': earthfundChildDaoStakingBalance,
    'sd-boost-twavp': sdBoostTWAVP,
    'unipilot-vault-pilot-balance': unipilotVaultPilotBalance,
    'balance-of-with-linear-vesting-power': balanceOfWithLinearVestingPower,
    'linear-vesting-power': linearVestingPower,
    'lrc-l2-subgraph-balance-of': lrcL2SubgraphBalanceOf,
    'lrc-l2-nft-balance-of': lrcL2NftBalanceOf,
    'lrc-lp-subgraph-balance-of': lrcLPSubgraphBalanceOf,
    'lrc-nft-search-mult': lrcNFTmult,
    'bancor-pool-token-underlying-balance': bancorPoolTokenUnderlyingBalance,
    'balance-of-subgraph': balanceOfSubgraph,
    'wagdie-subgraph': wagdieSubgraph,
    'erc721-pair-weights': erc721PairWeights,
    'harmony-staking': harmonyStaking,
    'erc3525-flexible-voucher': erc3525FlexibleVoucher,
    'orca-pod': orcaPod,
    'metropolis-pod': metropolisPod,
    'proxyprotocol-erc721-balance-of': proxyProtocolErc721BalanceOf,
    'posichain-staking': posichainStaking,
    'posichain-total-balance': posichainTotalBalance,
    'arrow-vesting': arrowVesting,
    'tutellus-protocol': tutellusProtocol,
    'fight-club': fightClub,
    'tpro-staking': tproStaking,
    'safe-vested': safeVested,
    'otterspace-badges': otterspaceBadges,
    'synthetic-nouns-with-claimer': syntheticNounsClaimerOwner,
    'echelon-wallet-prime-and-cached-key': echelonWalletPrimeAndCachedKey,
    'nation3-votes-with-delegations': nation3VotesWIthDelegations,
    'nation3-passport-coop-with-delegations': nation3CoopPassportWithDelegations,
    'erc20-tokens-per-uni': erc20TokensPerUni,
    'bancor-standard-rewards-underlying-balance': bancorStandardRewardsUnderlyingBalance,
    'sd-vote-boost': sdVoteBoost,
    'sd-vote-boost-twavp': sdVoteBoostTWAVP,
    spreadsheet,
    'offchain-delegation': offchainDelegation,
    'ninechronicles-staked-and-dcc': ninechroniclesStakedAndDcc,
    'rep3-badges': rep3Badges,
    marsecosystem,
    'ari10-staking-locked': ari10StakingLocked,
    'skale-delegation-weighted': skaleDelegationWeighted,
    reliquary,
    'jpegd-locked-jpeg-of': jpegdLockedJpegOf,
    'lodestar-vesting': lodestarVesting,
    'lodestar-staked-lp': lodestarStakedLp,
    'battlefly-vgfly-and-staked-gfly': battleflyVGFLYAndStakedGFLY,
    'nexon-army-nft': nexonArmyNFT,
    'moonbeam-free-balance': moonbeamFreeBalance,
    'stakedotlink-vesting': stakedotlinkVesting,
    'psp-in-sepsp2-balance': pspInSePSP2Balance,
    'pdn-balances-and-vests': pdnBalancesAndVests,
    'lqty-proxy-stakers': lqtyProxyStakers,
    'rdnt-capital-voting': rdntCapitalVoting,
    'staked-defi-balance': stakedDefiBalance,
    'degenzoo-erc721-animals-weighted': degenzooErc721AnimalsWeighted,
    'zunami-pool-gauge-aggregated-balance-of': zunamiPoolGaugeAggregatedBalanceOf,
    'erc721-collateral-held': erc721CollateralHeld,
    'starlay-ve-balance-of-locker-id': starlayVeBalanceOfLockerId,
    'winr-staking': winrStaking,
    spaceid,
    'delegate-registry-v2': delegateRegistryV2,
    'hats-protocol-single-vote-per-org': hatsProtocolSingleVotePerOrg,
    'karma-discord-roles': karmaDiscordRoles,
    'seedify-cumulative-voting-power-hodl-staking-farming': seedifyHoldStakingFarming,
    'staked-morekudasai': stakedMoreKudasai,
    'sablier-v1-deposit': sablierV1Deposit,
    'sablier-v2': sablierV2,
    'gelato-staking': gelatoStaking,
    'erc4626-assets-of': erc4626AssetsOf,
    'friend-tech': friendTech,
    'sd-vote-boost-twavp-v2': sdVoteBoostTWAVPV2,
    'sd-vote-boost-twavp-v3': sdVoteBoostTWAVPV3,
    'sd-vote-boost-twavp-v4': sdVoteBoostTWAVPV4,
    'sd-vote-boost-twavp-vsdtoken': sdVoteBoostTWAVPVsdToken,
    'sd-vote-boost-twavp-balanceof': sdVoteBoostTWAVPBalanceof,
    moonbase: moonbase,
    'dss-vest-unpaid': dssVestUnpaid,
    'dss-vest-balance-and-unpaid': dssVestBalanceAndUnpaid,
    'eoa-balance-and-staking-pools': eoaBalanceAndStakingPools,
    'station-score-if-badge': stationScoreIfBadge,
    'station-constant-if-badge': stationConstantIfBadge,
    'mangrove-station-qv-scaled-to-mgv': mangroveStationQVScaledToMGV,
    floki,
    'hats-protocol-hat-id': hatsProtocolHatId,
    'hats-protocol-hat-ids': hatsProtocolHatIds,
    'bubblegum-kids': bubblegumKids,
    'clipper-staked-sail': clipperStakedSail,
    plearn,
    snote,
    streamr,
    'aavegotchi-agip-17': aavegotchiAgip17,
    'aavegotchi-agip-37-gltr-staked-lp': aavegotchiAgip37GltrStakedLp,
    'aavegotchi-agip-37-wap-ghst': aavegotchiAgip37WapGhst,
    agave,
    'arrakis-finance': arrakisFinance,
    'ctsi-staking-pool': ctsiStakingPool,
    'cyberkongz-v2': cyberkongzV2,
    'dextf-staked-in-vaults': dextfStakedInVaults,
    genomesdao,
    'goldfinch-membership': goldfinchMembership,
    'goldfinch-voting-power': goldfinchVotingPower,
    h2o,
    'hopr-staking-by-season': hoprStakingBySeason,
    'hopr-staking-s2': hoprStakingS2,
    ilv,
    'meebitsdao-delegation': meebitsdaoDelegation,
    'modefi-staking': modefiStaking,
    'orbs-network-delegation': orbsNetworkDelegation,
    'planet-finance-v2': planetFinanceV2,
    'rari-fuse': rariFuse,
    'synthetix-non-quadratic_1': synthetixNonQuadratic_1,
    'synthetix-quadratic': synthetixQuadratic,
    'synthetix-quadratic_1': synthetixQuadratic_1,
    synthetix_1,
    'total-axion-shares': totalAxionShares,
    'unipool-same-token': unipoolSameToken,
    'vendor-v2-borrower-collateral-balance-of': vendorV2BorrowerCollateralBalanceOf,
    'volt-voting-power': voltVotingPower,
    'xdai-stakers-and-holders': xdaiStakersAndHolders,
    'urbit-galaxies': urbitGalaxies,
    'vesting-balance-of': vestingBalanceOf
};
Object.keys(strategies).forEach(function (strategyName) {
    let examples = null;
    let schema = null;
    let about = '';
    try {
        examples = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, strategyName, 'examples.json'), 'utf8'));
    }
    catch (error) {
        examples = null;
    }
    try {
        schema = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, strategyName, 'schema.json'), 'utf8'));
    }
    catch (error) {
        schema = null;
    }
    try {
        about = (0, fs_1.readFileSync)(path_1.default.join(__dirname, strategyName, 'README.md'), 'utf8');
    }
    catch (error) {
        about = '';
    }
    strategies[strategyName].examples = examples;
    strategies[strategyName].schema = schema;
    strategies[strategyName].about = about;
});
exports.default = strategies;
