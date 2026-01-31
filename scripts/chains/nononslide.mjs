/**
 * Chain config for NononSlide dapp
 *
 * NononSlide contracts already exist on mainnet, so we just fork.
 * No deployment needed - we get all the contract state and NFTs automatically.
 */

export default {
  name: 'nononslide',
  description: 'Fork Ethereum mainnet for NononSlide testing',

  // Fork configuration
  fork: {
    enabled: true,
    url: process.env.FORK_RPC_URL || process.env.MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  },

  // Chain settings
  chainId: 1337,
  blockTime: 2,

  // No deployment needed - contracts exist on mainnet
  deploy: null,

  // Contracts we're interacting with (for reference)
  contracts: {
    nononSlide: '0xeddC891e17471071A7a5F9aa10178C57fAc6F352',
    nononNft: '0xD3607bc8c7927B348bac50dc224C28E3ce933ca6',
    friendCard: '0x74ECE89f9fc34643eACf79BfB4165D29CA5d92Cc',
  }
};
