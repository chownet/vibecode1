import { useState } from 'react';
import AuctionCard from './AuctionCard';

function AuctionList({ auctions, onBid, user, isConnected }) {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'ended'

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'active') return auction.status === 'active';
    if (filter === 'ended') return auction.status === 'closed';
    return true;
  });

  return (
    <div className="auction-list">
      <div className="filter-tabs">
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('ended')}
          className={filter === 'ended' ? 'active' : ''}
        >
          Ended
        </button>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="empty-state">
          <p>No auctions found. Create one to get started!</p>
        </div>
      ) : (
        <div className="auction-grid">
          {filteredAuctions.map(auction => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onBid={onBid}
              user={user}
              isConnected={isConnected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AuctionList;

