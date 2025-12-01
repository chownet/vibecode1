// Contract ABI and interaction utilities
// Replace CONTRACT_ADDRESS with your deployed contract address
import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// USDC token addresses
// Base Mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
// Base Sepolia: Test USDC token (you may need to deploy your own test token)
// For Base Sepolia, you can deploy a simple ERC20 test token or use an existing one
export const USDC_ADDRESS_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const USDC_ADDRESS_TESTNET = process.env.VITE_USDC_ADDRESS_TESTNET || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia test USDC (update this with your deployed test token)

// Network chain IDs
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

/**
 * Get USDC address based on current network
 */
export async function getUSDCAddress(provider) {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    if (chainId === BASE_SEPOLIA_CHAIN_ID) {
      return USDC_ADDRESS_TESTNET;
    } else if (chainId === BASE_MAINNET_CHAIN_ID) {
      return USDC_ADDRESS_MAINNET;
    } else {
      // Default to testnet for safety
      console.warn('Unknown network, defaulting to testnet USDC');
      return USDC_ADDRESS_TESTNET;
    }
  } catch (error) {
    console.error('Error detecting network:', error);
    // Default to testnet for safety
    return USDC_ADDRESS_TESTNET;
  }
}

// Default export for backward compatibility (will be overridden by getUSDCAddress)
export const USDC_ADDRESS = USDC_ADDRESS_TESTNET;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// ERC20 ABI for USDC
export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export const AUCTION_ESCROW_ABI = [
  "function createAuction(uint256 endTime, uint256 autoAcceptPrice) external returns (uint256)",
  "function placeBid(uint256 auctionId, uint256 bidAmount) external",
  "function closeAuction(uint256 auctionId) external",
  "function withdrawRefund() external",
  "function getAuction(uint256 auctionId) external view returns (address seller, uint256 endTime, uint256 highestBid, address highestBidder, uint256 autoAcceptPrice, bool isActive, bool isClosed)",
  "function getBid(uint256 auctionId, address bidder) external view returns (address bidderAddress, uint256 amount, uint256 timestamp, bool refunded)",
  "function getBidders(uint256 auctionId) external view returns (address[] memory)",
  "function pendingRefunds(address) external view returns (uint256)",
  "function auctionCounter() external view returns (uint256)",
  "function usdcToken() external view returns (address)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 endTime, uint256 autoAcceptPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionClosed(uint256 indexed auctionId, address indexed winner, uint256 finalBid)",
  "event FundsWithdrawn(address indexed seller, uint256 amount)"
];

/**
 * Get USDC token contract instance
 */
export async function getUSDCToken(provider) {
  const usdcAddress = await getUSDCAddress(provider);
  return new ethers.Contract(usdcAddress, ERC20_ABI, provider);
}

/**
 * Get contract instance
 */
export async function getContract(provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, AUCTION_ESCROW_ABI, provider);
}

/**
 * Convert USDC amount to token units (6 decimals)
 */
export function parseUSDC(amount) {
  return ethers.parseUnits(amount.toString(), USDC_DECIMALS);
}

/**
 * Convert USDC token units to human-readable amount
 */
export function formatUSDC(amount) {
  return ethers.formatUnits(amount, USDC_DECIMALS);
}

/**
 * Check and approve USDC spending
 */
export async function approveUSDC(provider, amount) {
  try {
    const usdcToken = await getUSDCToken(provider);
    const signer = await provider.getSigner();
    const usdcWithSigner = usdcToken.connect(signer);
    
    const amountWei = parseUSDC(amount);
    
    // Check current allowance
    const userAddress = await signer.getAddress();
    const currentAllowance = await usdcToken.allowance(userAddress, CONTRACT_ADDRESS);
    
    if (currentAllowance < amountWei) {
      // Approve the contract to spend USDC
      const tx = await usdcWithSigner.approve(CONTRACT_ADDRESS, amountWei);
      await tx.wait();
    }
    
    return true;
  } catch (error) {
    console.error('Error approving USDC:', error);
    throw error;
  }
}

/**
 * Get USDC balance for a user
 */
export async function getUSDCBalance(provider, address) {
  try {
    const usdcToken = await getUSDCToken(provider);
    const balance = await usdcToken.balanceOf(address);
    return formatUSDC(balance);
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}

/**
 * Create an auction on-chain
 */
export async function createAuctionOnChain(provider, endTime, autoAcceptPrice) {
  try {
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    // Convert autoAcceptPrice from USDC to token units (0 means no auto-accept)
    const autoAcceptPriceWei = autoAcceptPrice > 0 
      ? parseUSDC(autoAcceptPrice)
      : 0;
    
    const tx = await contractWithSigner.createAuction(endTime, autoAcceptPriceWei);
    const receipt = await tx.wait();
    
    // Get auction ID from event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed && parsed.name === 'AuctionCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      return parsed.args.auctionId.toString();
    }
    
    // Fallback: get latest auction ID
    const auctionCounter = await contract.auctionCounter();
    return auctionCounter.toString();
  } catch (error) {
    console.error('Error creating auction on-chain:', error);
    throw error;
  }
}

/**
 * Place a bid on-chain using USDC
 */
export async function placeBidOnChain(provider, auctionId, bidAmountUSDC) {
  try {
    // First, approve USDC spending
    await approveUSDC(provider, bidAmountUSDC);
    
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    // Convert USDC to token units
    const bidAmountWei = parseUSDC(bidAmountUSDC);
    
    const tx = await contractWithSigner.placeBid(auctionId, bidAmountWei);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error placing bid on-chain:', error);
    throw error;
  }
}

/**
 * Close an auction on-chain
 */
export async function closeAuctionOnChain(provider, auctionId) {
  try {
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    const tx = await contractWithSigner.closeAuction(auctionId);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error closing auction on-chain:', error);
    throw error;
  }
}

/**
 * Withdraw refunds
 */
export async function withdrawRefund(provider) {
  try {
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    const tx = await contractWithSigner.withdrawRefund();
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error('Error withdrawing refund:', error);
    throw error;
  }
}

/**
 * Get auction details from contract
 */
export async function getAuctionFromContract(provider, auctionId) {
  try {
    const contract = await getContract(provider);
    const auction = await contract.getAuction(auctionId);
    
    return {
      seller: auction.seller,
      endTime: Number(auction.endTime),
      highestBid: formatUSDC(auction.highestBid),
      highestBidder: auction.highestBidder,
      autoAcceptPrice: auction.autoAcceptPrice > 0 
        ? formatUSDC(auction.autoAcceptPrice)
        : null,
      isActive: auction.isActive,
      isClosed: auction.isClosed
    };
  } catch (error) {
    console.error('Error getting auction from contract:', error);
    return null;
  }
}

/**
 * Get pending refunds for a user (in USDC)
 */
export async function getPendingRefunds(provider, address) {
  try {
    const contract = await getContract(provider);
    const refunds = await contract.pendingRefunds(address);
    return formatUSDC(refunds);
  } catch (error) {
    console.error('Error getting pending refunds:', error);
    return '0';
  }
}
