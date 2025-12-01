import { useState, useEffect } from 'react';
import CountdownTimer from './CountdownTimer';

function AuctionCard({ auction, onBid, user, isConnected }) {
  const [bidAmount, setBidAmount] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  
  const now = Date.now();
  const endTime = auction.createdAt + (auction.durationMinutes * 60 * 1000);
  const isEnded = auction.status === 'closed' || now >= endTime;
  const highestBid = auction.bids.length > 0 ? auction.bids[0].amount : 0;
  const minBid = highestBid + 0.01;

  const handleBid = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (amount >= minBid && !isEnded) {
      onBid(auction.id, amount);
      setBidAmount('');
      setShowBidForm(false);
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
              <div className="bid-actions">
                <button type="submit" className="submit-bid">
                  Submit Bid
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBidForm(false);
                    setBidAmount('');
                  }}
                  className="cancel-bid"
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
                <span className="bidder">@{bid.bidder}</span>
                <span className="bid-amount">{bid.amount.toFixed(2)} ETH</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AuctionCard;

