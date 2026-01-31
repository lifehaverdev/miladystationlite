export const NONON_SLIDE_ADDRESS = '0xeddC891e17471071A7a5F9aa10178C57fAc6F352';
export const NONON_NFT_ADDRESS = '0xD3607bc8c7927B348bac50dc224C28E3ce933ca6';
export const FRIEND_CARD_ADDRESS = '0x74ECE89f9fc34643eACf79BfB4165D29CA5d92Cc';

export const SLIDE_STATUS = {
  Open: 0,
  Ready: 1,
  Closed: 2,
  Cancelled: 3
};

export const SLIDE_STATUS_LABELS = {
  0: 'Open',
  1: 'Ready',
  2: 'Closed',
  3: 'Cancelled'
};

export const NONON_SLIDE_ABI = [
  // Read functions
  {"inputs":[],"name":"nextSlideId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"slides","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"uint256","name":"gasPriceStandard","type":"uint256"},{"internalType":"uint256","name":"minPlayers","type":"uint256"},{"internalType":"uint256","name":"maxPlayers","type":"uint256"},{"internalType":"uint256","name":"pot","type":"uint256"},{"internalType":"enum NononSlideV2.SlideStatus","name":"status","type":"uint8"},{"internalType":"bool","name":"creatorOnlyExecute","type":"bool"},{"internalType":"uint256","name":"creatorPenalties","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"getSlideParticipants","outputs":[{"internalType":"address[]","name":"_players","type":"address[]"},{"internalType":"uint256[]","name":"_tokenIds","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"},{"internalType":"address","name":"player","type":"address"}],"name":"getRefundAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"getCreatorPenalties","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  // Write functions
  {"inputs":[{"internalType":"uint256","name":"_minPlayers","type":"uint256"},{"internalType":"uint256","name":"_maxPlayers","type":"uint256"},{"internalType":"bool","name":"_creatorOnlyExecute","type":"bool"}],"name":"createSlide","outputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"joinSlide","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"executeSlide","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"cancelSlide","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"claimCreatorPenalties","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"claimRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},
  // Events
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"slideId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"uint256","name":"minPlayers","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"maxPlayers","type":"uint256"}],"name":"SlideCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"slideId","type":"uint256"},{"indexed":true,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"SlideJoined","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"slideId","type":"uint256"},{"indexed":true,"internalType":"address","name":"executor","type":"address"},{"indexed":false,"internalType":"uint256","name":"numPlayers","type":"uint256"}],"name":"SlideExecuted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"slideId","type":"uint256"}],"name":"SlideCancelled","type":"event"}
];

export const NONON_NFT_ABI = [
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"tokensOfOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

export const FRIEND_CARD_ABI = [
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"hasSentToken","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"hasReceivedToken","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"points","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// Gas estimate per player from contract
export const GAS_ESTIMATE_PER_PLAYER = 150000;

// Circle layout threshold - above this use linear list
export const CIRCLE_LAYOUT_MAX = 8;
