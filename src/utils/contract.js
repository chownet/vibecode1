// Contract ABI and interaction utilities
// Replace CONTRACT_ADDRESS with your deployed contract address
import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const AUCTION_ESCROW_ABI = [
  "function createAuction(uint256 endTime, uint256 autoAcceptPrice) external returns (uint256)",
  "function placeBid(uint256 auctionId) external payable",
  "function closeAuction(uint256 auctionId) external",
  "function withdrawRefund() external",
  "function getAuction(uint256 auctionId) external view returns (address seller, uint256 endTime, uint256 highestBid, address highestBidder, uint256 autoAcceptPrice, bool isActive, bool isClosed)",
  "function getBid(uint256 auctionId, address bidder) external view returns (address bidderAddress, uint256 amount, uint256 timestamp, bool refunded)",
  "function getBidders(uint256 auctionId) external view returns (address[] memory)",
  "function pendingRefunds(address) external view returns (uint256)",
  "function auctionCounter() external view returns (uint256)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 endTime, uint256 autoAcceptPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionClosed(uint256 indexed auctionId, address indexed winner, uint256 finalBid)",
  "event FundsWithdrawn(address indexed seller, uint256 amount)"
];

/**
 * Get contract instance
 */
export async function getContract(provider) {
  const { ethers } = await import('ethers');
  return new ethers.Contract(CONTRACT_ADDRESS, AUCTION_ESCROW_ABI, provider);
}

/**
 * Create an auction on-chain
 */
export async function createAuctionOnChain(provider, endTime, autoAcceptPrice) {
  try {
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    // Convert autoAcceptPrice from ETH to wei (0 means no auto-accept)
    const autoAcceptPriceWei = autoAcceptPrice > 0 
      ? ethers.parseEther(autoAcceptPrice.toString())
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
 * Place a bid on-chain
 */
export async function placeBidOnChain(provider, auctionId, bidAmountETH) {
  try {
    const contract = await getContract(provider);
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    
    // Convert ETH to wei
    const bidAmountWei = ethers.parseEther(bidAmountETH.toString());
    
    const tx = await contractWithSigner.placeBid(auctionId, {
      value: bidAmountWei
    });
    
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
      highestBid: ethers.formatEther(auction.highestBid),
      highestBidder: auction.highestBidder,
      autoAcceptPrice: auction.autoAcceptPrice > 0 
        ? ethers.formatEther(auction.autoAcceptPrice)
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
 * Get pending refunds for a user
 */
export async function getPendingRefunds(provider, address) {
  try {
    const contract = await getContract(provider);
    const refunds = await contract.pendingRefunds(address);
    return ethers.formatEther(refunds);
  } catch (error) {
    console.error('Error getting pending refunds:', error);
    return '0';
  }
}

