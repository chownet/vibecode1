import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';

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
    const amount = parseFloat(bidAmount);
    
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (amount < minBid) {
      alert(`Minimum bid is ${minBid.toFixed(2)} ETH`);
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

      // Convert ETH to wei (1 ETH = 10^18 wei)
      const amountInWei = BigInt(Math.floor(amount * 1e18));
      const weiHex = '0x' + amountInWei.toString(16);

      setTxStatus('Requesting transaction approval...');
      
      // Estimate gas for the transaction
      let gasLimit = '0x5208'; // Default 21000 for simple transfer
      try {
        const estimatedGas = await ethProvider.request({
          method: 'eth_estimateGas',
          params: [{
            from: walletAddress,
            to: auctionCreatorAddress,
            value: weiHex,
          }]
        });
        gasLimit = estimatedGas;
      } catch (error) {
        console.warn('Gas estimation failed, using default:', error);
      }

      // Send transaction - sending ETH to the auction creator's address
      // In production, this would go to a smart contract escrow that holds funds
      // For now, we send directly to creator (in production, use auction contract)
      if (!auction.creatorAddress) {
        throw new Error('Auction creator address not found');
      }
      
      const auctionCreatorAddress = auction.creatorAddress;
      
      const txHash = await ethProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: auctionCreatorAddress, // In production: use auction contract address
          value: weiHex,
          gas: gasLimit,
        }]
      });

      setTxStatus('Transaction submitted! Waiting for confirmation...');

      // Wait for transaction confirmation
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (!receipt && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          receipt = await ethProvider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
        } catch (error) {
          console.warn('Waiting for transaction...', attempts);
        }
        attempts++;
      }

      if (receipt && receipt.status === '0x1') {
        setTxStatus('Transaction confirmed!');
        // Record the bid with transaction hash
        onBid(auction.id, amount, txHash);
        setBidAmount('');
        setShowBidForm(false);
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setTxStatus(null);
          setIsProcessing(false);
        }, 3000);
      } else {
        throw new Error('Transaction failed or timed out');
      }
    } catch (error) {
      console.error('Bid transaction error:', error);
      if (error.code === 4001) {
        setTxStatus('Transaction rejected by user');
        alert('Transaction was rejected. Please try again.');
      } else if (error.code === -32603) {
        setTxStatus('Transaction failed');
        alert('Transaction failed. Please check your balance and try again.');
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
            <span className="amount">{highestBid.toFixed(2)} ETH</span>
          </div>
          {auction.autoAcceptPrice && (
            <div className="auto-accept-price">
              <span className="label">Auto-Accept:</span>
              <span className="amount">{auction.autoAcceptPrice.toFixed(2)} ETH</span>
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
                  Winner: @{auction.winner.bidder} ({auction.winner.amount.toFixed(2)} ETH)
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
                  placeholder={`Min: ${minBid.toFixed(2)} ETH`}
                  className="bid-input"
                />
                <span className="eth-label">ETH</span>
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
                  <span className="bid-amount">{bid.amount.toFixed(2)} ETH</span>
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

