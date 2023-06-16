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
const ecoVotingPower = __importStar(require("./eco-voting-power"));
const dpsNFTStrategy = __importStar(require("./dps-nft-strategy"));
const dpsNFTStrategyNova = __importStar(require("./dps-nft-strategy-nova"));
const nounsPower = __importStar(require("./nouns-rfp-power"));
const erc20Votes = __importStar(require("./erc20-votes"));
const erc20VotesWithOverride = __importStar(require("./erc20-votes-with-override"));
const antiWhale = __importStar(require("./anti-whale"));
const balancer = __importStar(require("./balancer"));
const balancerErc20InternalBalanceOf = __importStar(require("./balancer-erc20-internal-balance-of"));
const sunder = __importStar(require("./sunder"));
const balancerSmartPool = __importStar(require("./balancer-smart-pool"));
const contractCall = __importStar(require("./contract-call"));
const dextfVaults = __importStar(require("./dextf-staked-in-vaults"));
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
const erc20BalanceOfWeighted = __importStar(require("./erc20-balance-of-weighted"));
const ethalendBalanceOf = __importStar(require("./ethalend-balance-of"));
const prepoVesting = __importStar(require("./prepo-vesting"));
const mintoBalanceAll = __importStar(require("./minto-balance-of-all"));
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
const synthetix = __importStar(require("./synthetix"));
const aelinCouncil = __importStar(require("./aelin-council"));
const synthetixQuadratic = __importStar(require("./synthetix-quadratic"));
const synthetixQuadraticOne = __importStar(require("./synthetix-quadratic_1"));
const synthetixQuadraticTwo = __importStar(require("./synthetix-quadratic_2"));
const synthetixOne = __importStar(require("./synthetix_1"));
const synthetixNonQuadratic = __importStar(require("./synthetix-non-quadratic"));
const synthetixNonQuadraticOne = __importStar(require("./synthetix-non-quadratic_1"));
const synthetixNonQuadraticTwo = __importStar(require("./synthetix-non-quadratic_2"));
const ctoken = __importStar(require("./ctoken"));
const cream = __importStar(require("./cream"));
const esd = __importStar(require("./esd"));
const esdDelegation = __importStar(require("./esd-delegation"));
const stakedUniswap = __importStar(require("./staked-uniswap"));
const piedao = __importStar(require("./piedao"));
const ethReceived = __importStar(require("./eth-received"));
const erc20Received = __importStar(require("./erc20-received"));
const ethPhilanthropy = __importStar(require("./eth-philanthropy"));
const xDaiEasyStaking = __importStar(require("./xdai-easy-staking"));
const xDaiPOSDAOStaking = __importStar(require("./xdai-posdao-staking"));
const xDaiStakeHolders = __importStar(require("./xdai-stake-holders"));
const xDaiStakeDelegation = __importStar(require("./xdai-stake-delegation"));
const defidollar = __importStar(require("./defidollar"));
const aavegotchi = __importStar(require("./aavegotchi"));
const aavegotchiAgip = __importStar(require("./aavegotchi-agip"));
const aavegotchiAgip17 = __importStar(require("./aavegotchi-agip-17"));
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
const delegationWithOverrides = __importStar(require("./delegation-with-overrides"));
const withDelegation = __importStar(require("./with-delegation"));
const ticket = __importStar(require("./ticket"));
const work = __importStar(require("./work"));
const ticketValidity = __importStar(require("./ticket-validity"));
const validation = __importStar(require("./validation"));
const opium = __importStar(require("./opium"));
const ocean = __importStar(require("./ocean-marketplace"));
const ocean_v4 = __importStar(require("./ocean-marketplace-v4"));
const theGraphBalance = __importStar(require("./the-graph-balance"));
const theGraphDelegation = __importStar(require("./the-graph-delegation"));
const theGraphIndexing = __importStar(require("./the-graph-indexing"));
const whitelist = __importStar(require("./whitelist"));
const whitelistWeighted = __importStar(require("./whitelist-weighted"));
const tokenlon = __importStar(require("./tokenlon"));
const rebased = __importStar(require("./rebased"));
const pobHash = __importStar(require("./pob-hash"));
const totalAxionShares = __importStar(require("./total-axion-shares"));
const erc1155BalanceOf = __importStar(require("./erc1155-balance-of"));
const erc1155BalanceOfCv = __importStar(require("./erc1155-balance-of-cv"));
const erc1155WithMultiplier = __importStar(require("./erc1155-with-multiplier"));
const compLikeVotes = __importStar(require("./comp-like-votes"));
const governorAlpha = __importStar(require("./governor-alpha"));
const pagination = __importStar(require("./pagination"));
const rulerStakedToken = __importStar(require("./ruler-staked-token"));
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
const avnBalanceOfStaked = __importStar(require("./avn-balance-of-staked"));
const badgeth = __importStar(require("./badgeth"));
const api = __importStar(require("./api"));
const apiPost = __importStar(require("./api-post"));
const apiV2 = __importStar(require("./api-v2"));
const xseen = __importStar(require("./xseen"));
const molochAll = __importStar(require("./moloch-all"));
const molochLoot = __importStar(require("./moloch-loot"));
const erc721Enumerable = __importStar(require("./erc721-enumerable"));
const erc721WithMultiplier = __importStar(require("./erc721-with-multiplier"));
const protofiErc721TierWeighted = __importStar(require("./protofi-erc721-tier-weighted"));
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
const coordinape = __importStar(require("./coordinape"));
const decentralandEstateSize = __importStar(require("./decentraland-estate-size"));
const decentralandWearableRariry = __importStar(require("./decentraland-wearable-rarity"));
const decentralandRentalLessors = __importStar(require("./decentraland-rental-lessors"));
const iotexBalance = __importStar(require("./iotex-balance"));
const iotexStakedBalance = __importStar(require("./iotex-staked-balance"));
const xrc20BalanceOf = __importStar(require("./xrc20-balance-of"));
const brightid = __importStar(require("./brightid"));
const inverseXINV = __importStar(require("./inverse-xinv"));
const modefi = __importStar(require("./modefi"));
const modefiStaking = __importStar(require("./modefi-staking"));
const spookyswap = __importStar(require("./spookyswap"));
const squadzPower = __importStar(require("./squadz-power"));
const glide = __importStar(require("./glide"));
const goldfinchVotingPower = __importStar(require("./goldfinch-voting-power"));
const goldfinchMembership = __importStar(require("./goldfinch-membership"));
const rnbwBalance = __importStar(require("./rnbw-balance"));
const celerSgnDelegation = __importStar(require("./celer-sgn-delegation"));
const balancerDelegation = __importStar(require("./balancer-delegation"));
const infinityProtocolPools = __importStar(require("./infinityprotocol-liquidity-pools"));
const aaveGovernancePower = __importStar(require("./aave-governance-power"));
const cake = __importStar(require("./cake"));
const aks = __importStar(require("./aks"));
const tomyumswap = __importStar(require("./tomyumswap"));
const planetFinance = __importStar(require("./planet-finance"));
const planetFinancev2 = __importStar(require("./planet-finance-v2"));
const impossibleFinance = __importStar(require("./impossible-finance"));
const immutableX = __importStar(require("./immutable-x"));
const ogn = __importStar(require("./ogn"));
const oolongswap = __importStar(require("./oolongswap"));
const zrxVotingPower = __importStar(require("./zrx-voting-power"));
const tombFinance = __importStar(require("./tomb-finance"));
const trancheStakingSLICE = __importStar(require("./tranche-staking-slice"));
const unipoolSameToken = __importStar(require("./unipool-same-token"));
const unipoolUniv2Lp = __importStar(require("./unipool-univ2-lp"));
const unipoolXSushi = __importStar(require("./unipool-xsushi"));
const poap = __importStar(require("./poap"));
const poapWithWeight = __importStar(require("./poap-with-weight"));
const poapWithWeightV2 = __importStar(require("./poap-with-weight-v2"));
const uniswapV3 = __importStar(require("./uniswap-v3"));
const uniswapV3Staking = __importStar(require("./uniswap-v3-staking"));
const l2Deversifi = __importStar(require("./l2-deversifi"));
const vestedDeversifi = __importStar(require("./vested-deversifi"));
const biswap = __importStar(require("./biswap"));
const cronaswap = __importStar(require("./cronaswap"));
const honeyswap = __importStar(require("./honeyswap"));
const eglVote = __importStar(require("./egl-vote"));
const mcnFarm = __importStar(require("./mcn-farm"));
const snowswap = __importStar(require("./snowswap"));
const meebitsdao = __importStar(require("./meebitsdao"));
const membership = __importStar(require("./membership"));
const holdsTokens = __importStar(require("./holds-tokens"));
const crucibleERC20BalanceOf = __importStar(require("./crucible-erc20-balance-of"));
const erc20TokenAndLpWeighted = __importStar(require("./erc20-token-and-lp-weighted"));
const crucibleERC20TokenAndLpWeighted = __importStar(require("./crucible-erc20-token-and-lp-weighted"));
const hasrock = __importStar(require("./has-rock"));
const flexaCapacityStaking = __importStar(require("./flexa-capacity-staking"));
const sunriseGamingUniv2Lp = __importStar(require("./sunrisegaming-univ2-lp"));
const sunriseGamingStaking = __importStar(require("./sunrisegaming-staking"));
const sUmamiHolders = __importStar(require("./sumami-holders"));
const singleStakingAutoCompoundBalanceOf = __importStar(require("./single-staking-autocompound-balanceof"));
const singleStakingPoolsBalanceOf = __importStar(require("./single-staking-pools-balanceof"));
const occStakeOf = __importStar(require("./occ-stake-of"));
const hoprStaking = __importStar(require("./hopr-staking"));
const hoprStakingS2 = __importStar(require("./hopr-staking-s2"));
const hoprStakingBySeason = __importStar(require("./hopr-staking-by-season"));
const hoprBridgedBalance = __importStar(require("./hopr-bridged-balance"));
const hoprStakeAndBalanceQV = __importStar(require("./hopr-stake-and-balance-qv"));
const lootCharacterGuilds = __importStar(require("./loot-character-guilds"));
const swapr = __importStar(require("./swapr"));
const cyberkongz = __importStar(require("./cyberkongz"));
const cyberkongzV2 = __importStar(require("./cyberkongz-v2"));
const cyberkongzV3 = __importStar(require("./cyberkongz-v3"));
const compLikeVotesInclusive = __importStar(require("./comp-like-votes-inclusive"));
const mstable = __importStar(require("./mstable"));
const hashesVoting = __importStar(require("./hashes-voting"));
const hashflowGovernancePower = __importStar(require("./hashflow-governance-power"));
const hashflowVeHft = __importStar(require("./hashflow-vehft"));
const podLeader = __importStar(require("./pod-leader"));
const aavegotchiWagmiGuild = __importStar(require("./aavegotchi-wagmi-guild"));
const polisBalance = __importStar(require("./polis-balance"));
const techQuadraticRankedChoice = __importStar(require("./tech-quadratic-ranked-choice"));
const mutantCatsStakersAndHolders = __importStar(require("./mutant-cats-stakers-and-holders"));
const vaultTokenLpBalance = __importStar(require("./vault-token-lp-balance"));
const singleStakingVaultBalanceOf = __importStar(require("./single-staking-vault-balanceof"));
const razorVoting = __importStar(require("./razor-network-voting"));
const svsStaking = __importStar(require("./svs-staking"));
const mcbBalanceFromGraph = __importStar(require("./mcb-balance-from-graph"));
const colonyReputation = __importStar(require("./colony-reputation"));
const radicleCommunityTokens = __importStar(require("./radicle-community-tokens"));
const digitalaxMonaQuickswap = __importStar(require("./digitalax-mona-quickswap"));
const digitalaxDecoToMona = __importStar(require("./digitalax-deco-to-mona"));
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
const blockzerolabsCryptonauts = __importStar(require("./blockzerolabs-cryptonauts"));
const math = __importStar(require("./math"));
const pushVotingPower = __importStar(require("./push-voting-power"));
const stakedPSPBalance = __importStar(require("./staked-psp-balance"));
const erc20BalanceOfContractMultiplier = __importStar(require("./erc20-balance-of-contract-multiplier"));
const agave = __importStar(require("./agave"));
const juicebox = __importStar(require("./juicebox"));
const snetFarmers = __importStar(require("./snet-farmers"));
const snetStakers = __importStar(require("./snet-stakers"));
const snetLiquidityProviders = __importStar(require("./snet-liquidity-providers"));
const minMaxMcnFarm = __importStar(require("./minmax-mcn-farm"));
const unstackedToadzAndStackedToadzStakers = __importStar(require("./unstackedtoadz-and-stackedtoadz-stakers"));
const jadeSmrt = __importStar(require("./jade-smrt"));
const oceanDAOBrightID = __importStar(require("./ocean-dao-brightid"));
const saddleFinance = __importStar(require("./saddle-finance"));
const saddleFinanceV2 = __importStar(require("./saddle-finance-v2"));
const lydiaGovVault = __importStar(require("./lydia-gov-vault"));
const xkawaFarm = __importStar(require("./xkawa-farm"));
const darkforestScore = __importStar(require("./darkforest-score"));
const orangeReputationBasedVoting = __importStar(require("./orange-reputation-based-voting"));
const orangeReputationNftBasedVoting = __importStar(require("./orange-reputation-nft-based-voting"));
const squidDao = __importStar(require("./squid-dao"));
const pathBalanceStakedAndLocked = __importStar(require("./path-balance-staked-and-locked"));
const bottoDao = __importStar(require("./botto-dao"));
const genart = __importStar(require("./genart"));
const erc721MultiRegistryWeighted = __importStar(require("./erc721-multi-registry-weighted"));
const genomesdao = __importStar(require("./genomesdao"));
const zorro = __importStar(require("./zorro"));
const voltVotingPower = __importStar(require("./volt-voting-power"));
const balancerPoolid = __importStar(require("./balancer-poolid"));
const stakedBalancer = __importStar(require("./staked-balancer"));
const stakedUniswapModifiable = __importStar(require("./staked-uniswap-modifiable"));
const givethXdaiBalance = __importStar(require("./giveth-xdai-balance"));
const givethGnosisBalanceV2 = __importStar(require("./giveth-gnosis-balance-v2"));
const givethBalancerBalance = __importStar(require("./giveth-balancer-balance"));
const erc1155BalanceOfIds = __importStar(require("./erc1155-balance-of-ids"));
const erc1155BalanceOfIdsWeighted = __importStar(require("./erc1155-balance-of-ids-weighted"));
const erc1155weighted = __importStar(require("./erc1155-weighted-by-id"));
const stakersAndHolders = __importStar(require("./stakers-and-holders"));
const banksyDao = __importStar(require("./banksy-dao"));
const spacey2025 = __importStar(require("./spacey2025"));
const sandmanDao = __importStar(require("./sandman-dao"));
const ethercatsFounderSeries = __importStar(require("./ethercats-founder-series"));
const veBalanceOfAt = __importStar(require("./ve-balance-of-at"));
const veRibbon = __importStar(require("./ve-ribbon"));
const veRibbonVotingPower = __importStar(require("./ve-ribbon-voting-power"));
const chubbykaijudao = __importStar(require("./chubbykaijudao"));
const landDaoTiers = __importStar(require("./landdao-token-tiers"));
const defiplaza = __importStar(require("./defiplaza"));
const stakingClaimedUnclaimed = __importStar(require("./staking-claimed-unclaimed"));
const gysrStakingBalance = __importStar(require("./gysr-staking-balance"));
const gysrPendingRewards = __importStar(require("./gysr-pending-rewards"));
const gysrLPStakingBalance = __importStar(require("./gysr-lp-staking-balance"));
const wanakafarmStaking = __importStar(require("./wanakafarm-staking"));
const starsharks = __importStar(require("./starsharks"));
const printerFinancial = __importStar(require("./printer-financial"));
const ethercatsFoundersSeries = __importStar(require("./ethercats-founders-series"));
const potion = __importStar(require("./potion"));
const MinotaurMoney = __importStar(require("./minotaur-money"));
const safetyModuleBptPower = __importStar(require("./safety-module-bpt-power"));
const convFinance = __importStar(require("./conv-finance"));
const sdBoost = __importStar(require("./sd-boost"));
const capitalDaoStaking = __importStar(require("./capitaldao-staking"));
const erc20RebaseWrapper = __importStar(require("./erc20-rebase-wrapper"));
const wanakafarmLandIngame = __importStar(require("./wanakafarm-land-ingame"));
const meebitsDaoDelegation = __importStar(require("./meebitsdao-delegation"));
const starcatchersTopWindow = __importStar(require("./starcatchers-top-window"));
const gno = __importStar(require("./gno"));
const umaVoting = __importStar(require("./uma-voting"));
const masterchefPoolBalanceNoRewarddebt = __importStar(require("./masterchef-pool-balance-no-rewarddebt"));
const proofOfHumanity = __importStar(require("./proof-of-humanity"));
const samuraiLegendsGeneralsBalance = __importStar(require("./samurailegends-generals-balance"));
const dogsUnchained = __importStar(require("./dogs-unchained"));
const stakeDAOGovernanceUpdate = __importStar(require("./stakedao-governance-update"));
const umamiVoting = __importStar(require("./umami-voting"));
const liquidityTokenProvide = __importStar(require("./liquidity-token-provide"));
const gamiumVoting = __importStar(require("./gamium-voting"));
const citydaoSquareRoot = __importStar(require("./citydao-square-root"));
const recusalList = __importStar(require("./recusal-list"));
const rowdyRoos = __importStar(require("./rowdy-roos"));
const ethermon721 = __importStar(require("./ethermon-erc721"));
const etherorcsComboBalanceOf = __importStar(require("./etherorcs-combo-balanceof"));
const hedgey = __importStar(require("./hedgey"));
const hedgeyMulti = __importStar(require("./hedgey-multi"));
const hedgeyDelegate = __importStar(require("./hedgey-delegate"));
const sybilProtection = __importStar(require("./sybil-protection"));
const veBalanceOfAtNFT = __importStar(require("./ve-balance-of-at-nft"));
const genzeesFromSubgraph = __importStar(require("./genzees-from-subgraph"));
const ginFinance = __importStar(require("./gin-finance"));
const positionGovernancePower = __importStar(require("./position-governance-power"));
const creditLp = __importStar(require("./credit-lp"));
const helix = __importStar(require("./helix"));
const arrakisFinance = __importStar(require("./arrakis-finance"));
const auraFinance = __importStar(require("./aura-vlaura-vebal"));
const auraFinanceWithOverrides = __importStar(require("./aura-vlaura-vebal-with-overrides"));
const auraBalanceOfVlauraVebal = __importStar(require("./aura-balance-of-vlaura-vebal"));
const auraBalanceOfSingleAsset = __importStar(require("./aura-vault-balance-of-single-asset"));
const rocketpoolNodeOperator = __importStar(require("./rocketpool-node-operator"));
const earthfundChildDaoStakingBalance = __importStar(require("./earthfund-child-dao-staking-balance"));
const unipilotVaultPilotBalance = __importStar(require("./unipilot-vault-pilot-balance"));
const sdBoostTWAVP = __importStar(require("./sd-boost-twavp"));
const apeswap = __importStar(require("./apeswap"));
const fortaShares = __importStar(require("./forta-shares"));
const solvVoucherClaimable = __importStar(require("./solv-voucher-claimable"));
const h2o = __importStar(require("./h2o"));
const dopamine = __importStar(require("./dopamine"));
const lrcL2SubgraphBalanceOf = __importStar(require("./lrc-l2-subgraph-balance-of"));
const lrcL2NftBalanceOf = __importStar(require("./lrc-l2-nft-balance-of"));
const lrcLPSubgraphBalanceOf = __importStar(require("./lrc-lp-subgraph-balance-of"));
const lrcNFTDAOSearch = __importStar(require("./lrc-nft-dao-search"));
const lrcNFTmult = __importStar(require("./lrc-nft-search-mult"));
const erc3525VestingVoucher = __importStar(require("./erc3525-vesting-voucher"));
const rariFuse = __importStar(require("./rari-fuse"));
const selfswap = __importStar(require("./selfswap"));
const xrookBalanceOfUnderlyingWeighted = __importStar(require("./xrook-balance-of-underlying-weighted"));
const bancorPoolTokenUnderlyingBalance = __importStar(require("./bancor-pool-token-underlying-balance"));
const orbsNetworkDelegation = __importStar(require("./orbs-network-delegation"));
const balanceOfSubgraph = __importStar(require("./balance-of-subgraph"));
const wagdieSubgraph = __importStar(require("./wagdie-subgraph"));
const erc3525FlexibleVoucher = __importStar(require("./erc3525-flexible-voucher"));
const erc721PairWeights = __importStar(require("./erc721-pair-weights"));
const harmonyStaking = __importStar(require("./harmony-staking"));
const echelonCachedErc1155Decay = __importStar(require("./echelon-cached-erc1155-decay"));
const orcaPod = __importStar(require("./orca-pod"));
const metropolisPod = __importStar(require("./metropolis-pod"));
const proxyProtocolErc20BalanceOf = __importStar(require("./proxyprotocol-erc20-balance-of"));
const proxyProtocolErc721BalanceOf = __importStar(require("./proxyprotocol-erc721-balance-of"));
const proxyProtocolErc1155BalanceOf = __importStar(require("./proxyprotocol-erc1155-balance-of"));
const arrowVesting = __importStar(require("./arrow-vesting"));
const tutellusProtocol = __importStar(require("./tutellus-protocol"));
const fightClub = __importStar(require("./fight-club"));
const tproStaking = __importStar(require("./tpro-staking"));
const safeVested = __importStar(require("./safe-vested"));
const riskharborUnderwriter = __importStar(require("./riskharbor-underwriter"));
const otterspaceBadges = __importStar(require("./otterspace-badges"));
const syntheticNounsClaimerOwner = __importStar(require("./synthetic-nouns-with-claimer"));
const depositInSablierStream = __importStar(require("./deposit-in-sablier-stream"));
const echelonWalletPrimeAndCachedKey = __importStar(require("./echelon-wallet-prime-and-cached-key"));
const nation3VotesWIthDelegations = __importStar(require("./nation3-votes-with-delegations"));
const aavegotchiAgip37WapGhst = __importStar(require("./aavegotchi-agip-37-wap-ghst"));
const aavegotchiAgip37GltrStakedLp = __importStar(require("./aavegotchi-agip-37-gltr-staked-lp"));
const posichainStaking = __importStar(require("./posichain-staking"));
const posichainTotalBalance = __importStar(require("./posichain-total-balance"));
const erc20TokensPerUni = __importStar(require("./erc20-tokens-per-uni"));
const bancorStandardRewardsUnderlyingBalance = __importStar(require("./bancor-standard-rewards-underlying-balance"));
const sdVoteBoost = __importStar(require("./sd-vote-boost"));
const sdVoteBoostTWAVP = __importStar(require("./sd-vote-boost-twavp"));
const clqdrBalanceWithLp = __importStar(require("./clqdr-balance-with-lp"));
const ninechroniclesStakedAndDcc = __importStar(require("./ninechronicles-staked-and-dcc"));
const spreadsheet = __importStar(require("./spreadsheet"));
const offchainDelegation = __importStar(require("./offchain-delegation"));
const dslaParametricStakingServiceCredits = __importStar(require("./dsla-parametric-staking-service-credits"));
const rep3Badges = __importStar(require("./rep3-badges"));
const marsecosystem = __importStar(require("./marsecosystem"));
const ari10StakingLocked = __importStar(require("./ari10-staking-locked"));
const multichainSerie = __importStar(require("./multichain-serie"));
const ctsiStaking = __importStar(require("./ctsi-staking"));
const ctsiStakingPool = __importStar(require("./ctsi-staking-pool"));
const skaleDelegationWeighted = __importStar(require("./skale-delegation-weighted"));
const reliquary = __importStar(require("./reliquary"));
const acrossStakedAcx = __importStar(require("./across-staked-acx"));
const vstaPoolStaking = __importStar(require("./vsta-pool-staking"));
const lodestarVesting = __importStar(require("./lodestar-vesting"));
const lodestarStakedLp = __importStar(require("./lodestar-staked-lp"));
const jpegdLockedJpegOf = __importStar(require("./jpegd-locked-jpeg-of"));
const litDaoGovernance = __importStar(require("./lit-dao-governance"));
const babywealthyclub = __importStar(require("./babywealthyclub"));
const battleflyVGFLYAndStakedGFLY = __importStar(require("./battlefly-vgfly-and-staked-gfly"));
const nexonArmyNFT = __importStar(require("./nexon-army-nft"));
const moonbeamFreeBalance = __importStar(require("./moonbeam-free-balance"));
const stakedotlinkVesting = __importStar(require("./stakedotlink-vesting"));
const pspInSePSP2Balance = __importStar(require("./psp-in-sepsp2-balance"));
const pdnBalancesAndVests = __importStar(require("./pdn-balances-and-vests"));
const izumiVeiZi = __importStar(require("./izumi-veizi"));
const lqtyProxyStakers = __importStar(require("./lqty-proxy-stakers"));
const echelonWalletPrimeAndCachedKeyGated = __importStar(require("./echelon-wallet-prime-and-cached-key-gated"));
const rdntCapitalVoting = __importStar(require("./rdnt-capital-voting"));
const stakedDefiBalance = __importStar(require("./staked-defi-balance"));
const degenzooErc721AnimalsWeighted = __importStar(require("./degenzoo-erc721-animals-weighted"));
const capVotingPower = __importStar(require("./cap-voting-power"));
const zunamiPoolGaugeAggregatedBalanceOf = __importStar(require("./zunami-pool-gauge-aggregated-balance-of"));
const erc721CollateralHeld = __importStar(require("./erc721-collateral-held"));
const starlayVeBalanceOfLockerId = __importStar(require("./starlay-ve-balance-of-locker-id"));
const winrStaking = __importStar(require("./winr-staking"));
const spaceid = __importStar(require("./spaceid"));
const strategies = {
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
    'giveth-xdai-balance': givethXdaiBalance,
    'giveth-gnosis-balance-v2': givethGnosisBalanceV2,
    'nouns-rfp-power': nounsPower,
    coordinape,
    'anti-whale': antiWhale,
    balancer,
    sunder,
    'balancer-smart-pool': balancerSmartPool,
    'lit-dao-governance': litDaoGovernance,
    'balancer-erc20-internal-balance-of': balancerErc20InternalBalanceOf,
    'balance-in-vdfyn-vault': vDfynVault,
    'erc20-received': erc20Received,
    'contract-call': contractCall,
    defiplaza: defiplaza,
    'dextf-staked-in-vaults': dextfVaults,
    'dfyn-staked-in-farms': dfynFarms,
    'dfyn-staked-in-vaults': dfynVaults,
    'dps-nft-strategy': dpsNFTStrategy,
    'dps-nft-strategy-nova': dpsNFTStrategyNova,
    'eth-received': ethReceived,
    'eth-philanthropy': ethPhilanthropy,
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
    'erc20-balance-of-weighted': erc20BalanceOfWeighted,
    'minto-balance-of-all': mintoBalanceAll,
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
    'protofi-erc721-tier-weighted': protofiErc721TierWeighted,
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
    synthetix,
    'aelin-council': aelinCouncil,
    'synthetix-quadratic': synthetixQuadratic,
    'synthetix-quadratic_1': synthetixQuadraticOne,
    'synthetix-quadratic_2': synthetixQuadraticTwo,
    synthetix_1: synthetixOne,
    'synthetix-non-quadratic': synthetixNonQuadratic,
    'synthetix-non-quadratic_1': synthetixNonQuadraticOne,
    'synthetix-non-quadratic_2': synthetixNonQuadraticTwo,
    ctoken,
    cream,
    'staked-uniswap': stakedUniswap,
    esd,
    'esd-delegation': esdDelegation,
    piedao,
    'xdai-easy-staking': xDaiEasyStaking,
    'xdai-posdao-staking': xDaiPOSDAOStaking,
    'xdai-stake-holders': xDaiStakeHolders,
    'xdai-stake-delegation': xDaiStakeDelegation,
    defidollar,
    aavegotchi,
    'aavegotchi-agip': aavegotchiAgip,
    'aavegotchi-agip-17': aavegotchiAgip17,
    mithcash,
    stablexswap,
    dittomoney,
    'staked-keep': stakedKeep,
    'staked-daomaker': stakedDaomaker,
    'balancer-unipool': balancerUnipool,
    typhoon,
    delegation,
    'delegation-with-overrides': delegationWithOverrides,
    'with-delegation': withDelegation,
    ticket,
    work,
    'ticket-validity': ticketValidity,
    validation,
    opium,
    'ocean-marketplace': ocean,
    'ocean-marketplace-v4': ocean_v4,
    'the-graph-balance': theGraphBalance,
    'the-graph-delegation': theGraphDelegation,
    'the-graph-indexing': theGraphIndexing,
    whitelist,
    'whitelist-weighted': whitelistWeighted,
    tokenlon,
    rebased,
    'pob-hash': pobHash,
    'total-axion-shares': totalAxionShares,
    'comp-like-votes': compLikeVotes,
    'governor-alpha': governorAlpha,
    pagination,
    'ruler-staked-token': rulerStakedToken,
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
    'avn-balance-of-staked': avnBalanceOfStaked,
    api,
    'api-post': apiPost,
    'api-v2': apiV2,
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
    'modefi-staking': modefiStaking,
    'iotex-balance': iotexBalance,
    'iotex-staked-balance': iotexStakedBalance,
    'xrc20-balance-of': xrc20BalanceOf,
    spookyswap,
    'squadz-power': squadzPower,
    glide,
    'goldfinch-voting-power': goldfinchVotingPower,
    'goldfinch-membership': goldfinchMembership,
    'rnbw-balance': rnbwBalance,
    'celer-sgn-delegation': celerSgnDelegation,
    'balancer-delegation': balancerDelegation,
    'infinityprotocol-liquidity-pools': infinityProtocolPools,
    'aave-governance-power': aaveGovernancePower,
    cake,
    aks,
    tomyumswap,
    'planet-finance': planetFinance,
    'planet-finance-v2': planetFinancev2,
    ogn,
    oolongswap,
    'impossible-finance': impossibleFinance,
    'immutable-x': immutableX,
    badgeth,
    'zrx-voting-power': zrxVotingPower,
    'tomb-finance': tombFinance,
    'tranche-staking-slice': trancheStakingSLICE,
    'unipool-same-token': unipoolSameToken,
    'unipool-univ2-lp': unipoolUniv2Lp,
    'unipool-xsushi': unipoolXSushi,
    poap: poap,
    'poap-with-weight': poapWithWeight,
    'poap-with-weight-v2': poapWithWeightV2,
    'uniswap-v3': uniswapV3,
    'uniswap-v3-staking': uniswapV3Staking,
    'l2-deversifi': l2Deversifi,
    'vested-deversifi': vestedDeversifi,
    biswap,
    cronaswap,
    honeyswap,
    'egl-vote': eglVote,
    'mcn-farm': mcnFarm,
    snowswap,
    meebitsdao,
    'crucible-erc20-balance-of': crucibleERC20BalanceOf,
    'erc20-token-and-lp-weighted': erc20TokenAndLpWeighted,
    'crucible-erc20-token-and-lp-weighted': crucibleERC20TokenAndLpWeighted,
    'has-rock': hasrock,
    'flexa-capacity-staking': flexaCapacityStaking,
    'sunrisegaming-univ2-lp': sunriseGamingUniv2Lp,
    'sunrisegaming-staking': sunriseGamingStaking,
    'single-staking-autocompound-balanceof': singleStakingAutoCompoundBalanceOf,
    'single-staking-pools-balanceof': singleStakingPoolsBalanceOf,
    'hopr-staking': hoprStaking,
    'hopr-staking-s2': hoprStakingS2,
    'hopr-staking-by-season': hoprStakingBySeason,
    'hopr-stake-and-balance-qv': hoprStakeAndBalanceQV,
    'hopr-bridged-balance': hoprBridgedBalance,
    'occ-stake-of': occStakeOf,
    swapr,
    'holds-tokens': holdsTokens,
    'loot-character-guilds': lootCharacterGuilds,
    cyberkongz: cyberkongz,
    'cyberkongz-v2': cyberkongzV2,
    'cyberkongz-v3': cyberkongzV3,
    'comp-like-votes-inclusive': compLikeVotesInclusive,
    mstable,
    'hashes-voting': hashesVoting,
    'hashflow-governance-power': hashflowGovernancePower,
    'hashflow-vehft': hashflowVeHft,
    'pod-leader': podLeader,
    'aavegotchi-wagmi-guild': aavegotchiWagmiGuild,
    'polis-balance': polisBalance,
    'vault-token-lp-balance': vaultTokenLpBalance,
    'single-staking-vault-balanceof': singleStakingVaultBalanceOf,
    'mutant-cats-stakers-and-holders': mutantCatsStakersAndHolders,
    'razor-network-voting': razorVoting,
    'svs-staking': svsStaking,
    'mcb-balance-from-graph': mcbBalanceFromGraph,
    'radicle-community-tokens': radicleCommunityTokens,
    'digitalax-mona-quickswap': digitalaxMonaQuickswap,
    'digitalax-deco-to-mona': digitalaxDecoToMona,
    'digitalax-genesis-contribution': digitalaxGenesisContribution,
    'digitalax-lp-stakers': digitalaxLPStakers,
    'digitalax-mona-stakers-matic': digitalaxMonaStakersMatic,
    'digitalax-lp-stakers-matic': digitalaxLPStakersMatic,
    'colony-reputation': colonyReputation,
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
    'blockzerolabs-cryptonauts': blockzerolabsCryptonauts,
    math,
    'push-voting-power': pushVotingPower,
    'staked-psp-balance': stakedPSPBalance,
    'erc20-balance-of-contract-multiplier': erc20BalanceOfContractMultiplier,
    agave,
    juicebox,
    'snet-farmers': snetFarmers,
    'snet-stakers': snetStakers,
    'snet-liquidity-providers': snetLiquidityProviders,
    'minmax-mcn-farm': minMaxMcnFarm,
    'unstackedtoadz-and-stackedtoadz-stakers': unstackedToadzAndStackedToadzStakers,
    'jade-smrt': jadeSmrt,
    'ocean-dao-brightid': oceanDAOBrightID,
    'saddle-finance': saddleFinance,
    'saddle-finance-v2': saddleFinanceV2,
    membership: membership,
    'lydia-gov-vault': lydiaGovVault,
    'xkawa-farm': xkawaFarm,
    'darkforest-score': darkforestScore,
    'orange-reputation-based-voting': orangeReputationBasedVoting,
    'orange-reputation-nft-based-voting': orangeReputationNftBasedVoting,
    'squid-dao': squidDao,
    'botto-dao': bottoDao,
    genart,
    genomesdao,
    'path-balance-staked-and-locked': pathBalanceStakedAndLocked,
    'sumami-holders': sUmamiHolders,
    zorro,
    'volt-voting-power': voltVotingPower,
    'balancer-poolid': balancerPoolid,
    'staked-balancer': stakedBalancer,
    'staked-uniswap-modifiable': stakedUniswapModifiable,
    'erc1155-balance-of-ids': erc1155BalanceOfIds,
    'erc1155-balance-of-ids-weighted': erc1155BalanceOfIdsWeighted,
    'erc1155-weighted-by-id': erc1155weighted,
    'stakers-and-holders': stakersAndHolders,
    'banksy-dao': banksyDao,
    spacey2025: spacey2025,
    'sandman-dao': sandmanDao,
    'ethercats-founder-series': ethercatsFounderSeries,
    've-balance-of-at': veBalanceOfAt,
    've-ribbon': veRibbon,
    've-ribbon-voting-power': veRibbonVotingPower,
    chubbykaijudao: chubbykaijudao,
    revest: revest,
    'staking-claimed-unclaimed': stakingClaimedUnclaimed,
    'gysr-staking-balance': gysrStakingBalance,
    'gysr-pending-rewards': gysrPendingRewards,
    'gysr-lp-staking-balance': gysrLPStakingBalance,
    'wanakafarm-staking': wanakafarmStaking,
    starsharks,
    'printer-financial': printerFinancial,
    'ethercats-founders-series': ethercatsFoundersSeries,
    potion,
    'safety-module-bpt-power': safetyModuleBptPower,
    'minotaur-money': MinotaurMoney,
    'conv-finance': convFinance,
    'sd-boost': sdBoost,
    'capitaldao-staking': capitalDaoStaking,
    'erc20-rebase-wrapper': erc20RebaseWrapper,
    'wanakafarm-land-ingame': wanakafarmLandIngame,
    'meebitsdao-delegation': meebitsDaoDelegation,
    'starcatchers-top-window': starcatchersTopWindow,
    gno: gno,
    'gno-vote-weight': gno,
    'uma-voting': umaVoting,
    'masterchef-pool-balance-no-rewarddebt': masterchefPoolBalanceNoRewarddebt,
    'proof-of-humanity': proofOfHumanity,
    'sybil-protection': sybilProtection,
    'samurailegends-generals-balance': samuraiLegendsGeneralsBalance,
    'dogs-unchained': dogsUnchained,
    'stakedao-governance-update': stakeDAOGovernanceUpdate,
    'umami-voting': umamiVoting,
    'liquidity-token-provide': liquidityTokenProvide,
    'gamium-voting': gamiumVoting,
    'citydao-square-root': citydaoSquareRoot,
    'rowdy-roos': rowdyRoos,
    hedgey,
    'hedgey-multi': hedgeyMulti,
    'hedgey-delegate': hedgeyDelegate,
    've-balance-of-at-nft': veBalanceOfAtNFT,
    'genzees-from-subgraph': genzeesFromSubgraph,
    'gin-finance': ginFinance,
    'position-governance-power': positionGovernancePower,
    'credit-lp': creditLp,
    helix,
    'arrakis-finance': arrakisFinance,
    'aura-vlaura-vebal': auraFinance,
    'aura-vlaura-vebal-with-overrides': auraFinanceWithOverrides,
    'aura-balance-of-vlaura-vebal': auraBalanceOfVlauraVebal,
    'aura-vault-balance-of-single-asset': auraBalanceOfSingleAsset,
    'rocketpool-node-operator': rocketpoolNodeOperator,
    'earthfund-child-dao-staking-balance': earthfundChildDaoStakingBalance,
    'sd-boost-twavp': sdBoostTWAVP,
    'unipilot-vault-pilot-balance': unipilotVaultPilotBalance,
    'solv-voucher-claimable': solvVoucherClaimable,
    'balance-of-with-linear-vesting-power': balanceOfWithLinearVestingPower,
    'linear-vesting-power': linearVestingPower,
    apeswap,
    h2o,
    dopamine,
    'lrc-l2-subgraph-balance-of': lrcL2SubgraphBalanceOf,
    'lrc-l2-nft-balance-of': lrcL2NftBalanceOf,
    'lrc-lp-subgraph-balance-of': lrcLPSubgraphBalanceOf,
    'lrc-nft-dao-search': lrcNFTDAOSearch,
    'lrc-nft-search-mult': lrcNFTmult,
    'rari-fuse': rariFuse,
    'bancor-pool-token-underlying-balance': bancorPoolTokenUnderlyingBalance,
    selfswap,
    'erc3525-vesting-voucher': erc3525VestingVoucher,
    'xrook-balance-of-underlying-weighted': xrookBalanceOfUnderlyingWeighted,
    'orbs-network-delegation': orbsNetworkDelegation,
    'balance-of-subgraph': balanceOfSubgraph,
    'wagdie-subgraph': wagdieSubgraph,
    'erc721-pair-weights': erc721PairWeights,
    'harmony-staking': harmonyStaking,
    'echelon-cached-erc1155-decay': echelonCachedErc1155Decay,
    'erc3525-flexible-voucher': erc3525FlexibleVoucher,
    'orca-pod': orcaPod,
    'metropolis-pod': metropolisPod,
    'proxyprotocol-erc20-balance-of': proxyProtocolErc20BalanceOf,
    'proxyprotocol-erc721-balance-of': proxyProtocolErc721BalanceOf,
    'proxyprotocol-erc1155-balance-of': proxyProtocolErc1155BalanceOf,
    'posichain-staking': posichainStaking,
    'posichain-total-balance': posichainTotalBalance,
    'arrow-vesting': arrowVesting,
    'tutellus-protocol': tutellusProtocol,
    'fight-club': fightClub,
    'tpro-staking': tproStaking,
    'safe-vested': safeVested,
    'riskharbor-underwriter': riskharborUnderwriter,
    'otterspace-badges': otterspaceBadges,
    'synthetic-nouns-with-claimer': syntheticNounsClaimerOwner,
    'deposit-in-sablier-stream': depositInSablierStream,
    'echelon-wallet-prime-and-cached-key': echelonWalletPrimeAndCachedKey,
    'nation3-votes-with-delegations': nation3VotesWIthDelegations,
    'aavegotchi-agip-37-wap-ghst': aavegotchiAgip37WapGhst,
    'aavegotchi-agip-37-gltr-staked-lp': aavegotchiAgip37GltrStakedLp,
    'erc20-tokens-per-uni': erc20TokensPerUni,
    'bancor-standard-rewards-underlying-balance': bancorStandardRewardsUnderlyingBalance,
    'sd-vote-boost': sdVoteBoost,
    'sd-vote-boost-twavp': sdVoteBoostTWAVP,
    'clqdr-balance-with-lp': clqdrBalanceWithLp,
    spreadsheet,
    'offchain-delegation': offchainDelegation,
    'ninechronicles-staked-and-dcc': ninechroniclesStakedAndDcc,
    'dsla-parametric-staking-service-credits': dslaParametricStakingServiceCredits,
    'rep3-badges': rep3Badges,
    marsecosystem,
    'ari10-staking-locked': ari10StakingLocked,
    'multichain-serie': multichainSerie,
    'ctsi-staking': ctsiStaking,
    'ctsi-staking-pool': ctsiStakingPool,
    'skale-delegation-weighted': skaleDelegationWeighted,
    reliquary,
    'vsta-pool-staking': vstaPoolStaking,
    'jpegd-locked-jpeg-of': jpegdLockedJpegOf,
    'lodestar-vesting': lodestarVesting,
    'lodestar-staked-lp': lodestarStakedLp,
    babywealthyclub,
    'battlefly-vgfly-and-staked-gfly': battleflyVGFLYAndStakedGFLY,
    'nexon-army-nft': nexonArmyNFT,
    'moonbeam-free-balance': moonbeamFreeBalance,
    'stakedotlink-vesting': stakedotlinkVesting,
    'psp-in-sepsp2-balance': pspInSePSP2Balance,
    'pdn-balances-and-vests': pdnBalancesAndVests,
    'lqty-proxy-stakers': lqtyProxyStakers,
    'echelon-wallet-prime-and-cached-key-gated': echelonWalletPrimeAndCachedKeyGated,
    'rdnt-capital-voting': rdntCapitalVoting,
    'staked-defi-balance': stakedDefiBalance,
    'degenzoo-erc721-animals-weighted': degenzooErc721AnimalsWeighted,
    'zunami-pool-gauge-aggregated-balance-of': zunamiPoolGaugeAggregatedBalanceOf,
    'erc721-collateral-held': erc721CollateralHeld,
    'starlay-ve-balance-of-locker-id': starlayVeBalanceOfLockerId,
    'winr-staking': winrStaking,
    spaceid
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
