import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CountdownTimer from './CountdownTimer';
import * as contractUtils from '../utils/contract';

function AuctionCard({ auction, onBid, user, isConnected, walletAddress, ethProvider }) {
  const [bidAmount, setBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  
  const now = Date.now();
  const endTime = auction.createdAt + (auction.durationMinutes * 60 * 1000);
  const isEnded = auction.status === 'closed' || now >= endTime;
  const highestBid = auction.bids.length > 0 ? auction.bids[0].amount : 0;
  const minBid = highestBid + 0.01;

  const handleBid = async (e) => {
    e.preventDefault();
    console.log('Bid button clicked');
    
    const amount = parseFloat(bidAmount);
    console.log('Bid amount:', amount);
    
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }
    
    if (amount < minBid) {
      alert(`Minimum bid is ${minBid.toFixed(2)} USDC`);
      return;
    }
    
    if (isEnded) {
      alert('This auction has ended');
      return;
    }

    if (!ethProvider) {
      alert('Wallet provider not available');
      return;
    }

    console.log('Starting bid process...');
    setIsProcessing(true);
    setTxStatus('Preparing transaction...');

    try {
      // Verify wallet is still connected
      const accounts = await ethProvider.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        alert('Wallet disconnected. Please reconnect.');
        setIsProcessing(false);
        setTxStatus(null);
        return;
      }

      const provider = new ethers.BrowserProvider(ethProvider);
      let onChainAuctionId = auction.onChainId;

      // If auction doesn't have on-chain ID yet, create it on-chain first
      if (!onChainAuctionId) {
        setTxStatus('Creating auction on-chain...');
        
        // Check if contract is deployed
        if (contractUtils.CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
          const deployGuide = 'https://github.com/chownet/vibecode1/blob/main/DEPLOY_TO_TESTNET.md';
          alert(`Contract not deployed!\n\nTo use testnet (no real funds):\n\n1. Deploy TestUSDC token to Base Sepolia\n2. Deploy AuctionEscrow contract (with TestUSDC address)\n3. Update contract addresses in src/utils/contract.js\n\nSee: ${deployGuide}`);
          setIsProcessing(false);
          setTxStatus(null);
          return;
        }
        
        console.log('Creating auction on-chain, contract address:', contractUtils.CONTRACT_ADDRESS);

        // Calculate end time (current time + remaining duration in seconds)
        const remainingTime = Math.max(0, auction.endTime - Date.now());
        const endTime = Math.floor(Date.now() / 1000) + Math.floor(remainingTime / 1000);
        const autoAcceptPrice = auction.autoAcceptPrice || 0;

        // Create auction on-chain
        onChainAuctionId = await contractUtils.createAuctionOnChain(
          provider,
          endTime,
          autoAcceptPrice
        );

        // Update auction with on-chain ID
        onBid(auction.id, 0, null, onChainAuctionId); // Update auction with onChainId
      }

      setTxStatus('Requesting transaction approval...');
      console.log('Placing bid on-chain, auction ID:', onChainAuctionId, 'amount:', amount);

      // Use smart contract to place bid (requires wallet approval)
      const txHash = await contractUtils.placeBidOnChain(
        provider,
        onChainAuctionId,
        amount
      );
      
      console.log('Bid transaction hash:', txHash);

      setTxStatus('Transaction submitted! Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await provider.waitForTransaction(txHash, 1, 30000); // 30 second timeout

      if (receipt && receipt.status === 1) {
        setTxStatus('Transaction confirmed!');
        // Record the bid with transaction hash
        onBid(auction.id, amount, txHash, onChainAuctionId);
        setBidAmount('');
        setShowBidForm(false);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setTxStatus(null);
          setIsProcessing(false);
        }, 3000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Bid transaction error:', error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setTxStatus('Transaction rejected by user');
        alert('Transaction was rejected. Please try again.');
      } else if (error.message && error.message.includes('insufficient') || error.message.includes('Insufficient')) {
        setTxStatus('Insufficient USDC');
        alert('You do not have enough USDC to place this bid. Please check your USDC balance and allowance.');
      } else if (error.message && error.message.includes('Bid must be higher')) {
        setTxStatus('Bid too low');
        alert('Your bid must be higher than the current highest bid.');
      } else {
        setTxStatus('Error: ' + (error.message || 'Unknown error'));
        alert('Failed to place bid: ' + (error.message || 'Unknown error'));
      }
      setIsProcessing(false);
      setTimeout(() => setTxStatus(null), 5000);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className={`auction-card ${isEnded ? 'ended' : ''}`}>
      <div className="auction-header">
        <h3>{auction.title}</h3>
        <span className="creator">by @{auction.creator}</span>
      </div>

      <div className="auction-description">
        <p>{auction.description}</p>
      </div>

      <div className="auction-image">
        {auction.imageUrl ? (
          <img src={auction.imageUrl} alt={auction.title} />
        ) : (
          <div className="placeholder-image">📦</div>
        )}
      </div>

      <div className="auction-info">
        <div className="bid-info">
          <div className="current-bid">
            <span className="label">Current Bid:</span>
            <span className="amount">{highestBid.toFixed(2)} USDC</span>
          </div>
          {auction.autoAcceptPrice && (
            <div className="auto-accept-price">
              <span className="label">Auto-Accept:</span>
              <span className="amount">{auction.autoAcceptPrice.toFixed(2)} USDC</span>
            </div>
          )}
          <div className="bid-count">
            {auction.bids.length} {auction.bids.length === 1 ? 'bid' : 'bids'}
          </div>
        </div>

        <div className="timer-section">
          {isEnded ? (
            <div className="ended-badge">
              {auction.closedReason === 'price_reached' 
                ? '🎯 Closed - Price Reached!' 
                : '⏰ Auction Ended'}
              {auction.winner && (
                <div className="winner-info">
                  Winner: @{auction.winner.bidder} ({auction.winner.amount.toFixed(2)} USDC)
                </div>
              )}
            </div>
          ) : (
            <CountdownTimer endTime={endTime} />
          )}
        </div>
      </div>

      {!isEnded && isConnected && (
        <div className="bid-section">
          {!showBidForm ? (
            <button 
              onClick={() => setShowBidForm(true)}
              className="bid-button"
            >
              Place Bid
            </button>
          ) : (
            <form onSubmit={handleBid} className="bid-form">
              <div className="bid-input-group">
                <input
                  type="number"
                  step="0.01"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Min: ${minBid.toFixed(2)} USDC`}
                  className="bid-input"
                />
                <span className="eth-label">USDC</span>
              </div>
              {auction.autoAcceptPrice && parseFloat(bidAmount) >= auction.autoAcceptPrice && (
                <div className="auto-accept-warning">
                  ⚠️ This bid will immediately close the auction!
                </div>
              )}
              {txStatus && (
                <div className={`tx-status ${txStatus.includes('confirmed') ? 'success' : txStatus.includes('Error') || txStatus.includes('failed') ? 'error' : 'pending'}`}>
                  {txStatus}
                </div>
              )}
              <div className="bid-actions">
                <button 
                  type="submit" 
                  className="submit-bid"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Submit Bid'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBidForm(false);
                    setBidAmount('');
                    setTxStatus(null);
                    setIsProcessing(false);
                  }}
                  className="cancel-bid"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!isConnected && !isEnded && (
        <div className="connect-prompt">
          Connect wallet to place bids
        </div>
      )}

      {auction.bids.length > 0 && (
        <div className="bid-history">
          <h4>Recent Bids</h4>
          <ul>
            {auction.bids.slice(0, 3).map(bid => (
              <li key={bid.id}>
                <div className="bid-row">
                  <span className="bidder">@{bid.bidder}</span>
                  <span className="bid-amount">{bid.amount.toFixed(2)} USDC</span>
                </div>
                {bid.transactionHash && (
                  <div className="bid-tx">
                    <a 
                      href={`https://basescan.org/tx/${bid.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                    >
                      View on BaseScan
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AuctionCard;

