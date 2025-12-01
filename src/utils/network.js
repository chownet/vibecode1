// Network detection and switching utilities
import { ethers } from 'ethers';

export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const BASE_SEPOLIA_NETWORK = {
  chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

/**
 * Check if user is on Base Sepolia testnet
 */
export async function isOnBaseSepolia(provider) {
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId) === BASE_SEPOLIA_CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Switch to Base Sepolia testnet
 */
export async function switchToBaseSepolia(provider) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BASE_SEPOLIA_NETWORK.chainId }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [BASE_SEPOLIA_NETWORK],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Base Sepolia network:', addError);
        throw new Error('Failed to add Base Sepolia network. Please add it manually in MetaMask.');
      }
    } else {
      console.error('Error switching to Base Sepolia:', switchError);
      throw switchError;
    }
  }
}

/**
 * Ensure user is on Base Sepolia, prompt to switch if not
 */
export async function ensureBaseSepolia(provider) {
  const isOnTestnet = await isOnBaseSepolia(provider);
  
  if (!isOnTestnet) {
    const currentNetwork = await provider.getNetwork();
    const currentChainId = Number(currentNetwork.chainId);
    
    if (currentChainId === BASE_MAINNET_CHAIN_ID) {
      const shouldSwitch = confirm(
        'You are on Base Mainnet. This app uses testnet. Switch to Base Sepolia testnet?'
      );
      if (shouldSwitch) {
        await switchToBaseSepolia(provider);
        return true;
      } else {
        throw new Error('Please switch to Base Sepolia testnet to use this app.');
      }
    } else {
      const shouldSwitch = confirm(
        `You are on an unsupported network (Chain ID: ${currentChainId}). Switch to Base Sepolia testnet?`
      );
      if (shouldSwitch) {
        await switchToBaseSepolia(provider);
        return true;
      } else {
        throw new Error('Please switch to Base Sepolia testnet to use this app.');
      }
    }
  }
  
  return true;
}

