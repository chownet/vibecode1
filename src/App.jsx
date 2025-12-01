import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import AuctionList from './components/AuctionList';
import CreateAuction from './components/CreateAuction';
import './App.css';

function App() {
  const [auctions, setAuctions] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Load auctions from localStorage
    const savedAuctions = localStorage.getItem('auctions');
    if (savedAuctions) {
      setAuctions(JSON.parse(savedAuctions));
    }

    // Initialize Farcaster SDK
    sdk.initialize().then(() => {
      sdk.context.getContext().then((context) => {
        if (context?.user) {
          setUser(context.user);
          setIsConnected(true);
        }
      });
    });
  }, []);

  useEffect(() => {
    // Save auctions to localStorage whenever they change
    localStorage.setItem('auctions', JSON.stringify(auctions));
  }, [auctions]);

  // Auto-close auctions based on time limit or auto-accept price
  useEffect(() => {
    const checkAndCloseAuctions = () => {
      const now = Date.now();
      setAuctions(prevAuctions => {
        return prevAuctions.map(auction => {
          if (auction.status !== 'active') return auction;

          const endTime = auction.createdAt + (auction.durationMinutes * 60 * 1000);
          const highestBid = auction.bids.length > 0 ? auction.bids[0].amount : 0;
          
          // Check if time limit reached
          const timeLimitReached = now >= endTime;
          
          // Check if auto-accept price reached (if set)
          const priceReached = auction.autoAcceptPrice && highestBid >= auction.autoAcceptPrice;
          
          if (timeLimitReached || priceReached) {
            return {
              ...auction,
              status: 'closed',
              closedAt: now,
              closedReason: timeLimitReached ? 'time_limit' : 'price_reached',
              winner: auction.bids.length > 0 ? auction.bids[0] : null
            };
          }
          
          return auction;
        });
      });
    };

    // Check immediately
    checkAndCloseAuctions();

    // Check every second
    const interval = setInterval(checkAndCloseAuctions, 1000);

    return () => clearInterval(interval);
  }, [auctions.length]);

  const createAuction = (auctionData) => {
    const newAuction = {
      id: Date.now().toString(),
      ...auctionData,
      creator: user?.username || 'Anonymous',
      creatorFid: user?.fid || null,
      createdAt: Date.now(),
      bids: [],
      status: 'active'
    };
    setAuctions([newAuction, ...auctions]);
    setView('list');
  };

  const placeBid = (auctionId, bidAmount) => {
    setAuctions(prevAuctions => {
      return prevAuctions.map(auction => {
        if (auction.id === auctionId && auction.status === 'active') {
          const newBid = {
            id: Date.now().toString(),
            bidder: user?.username || 'Anonymous',
            bidderFid: user?.fid || null,
            amount: bidAmount,
            timestamp: Date.now()
          };
          
          const updatedAuction = {
            ...auction,
            bids: [...auction.bids, newBid].sort((a, b) => b.amount - a.amount)
          };

          // Check if this bid triggers auto-accept price
          const highestBid = updatedAuction.bids[0].amount;
          if (auction.autoAcceptPrice && highestBid >= auction.autoAcceptPrice) {
            updatedAuction.status = 'closed';
            updatedAuction.closedAt = Date.now();
            updatedAuction.closedReason = 'price_reached';
            updatedAuction.winner = updatedAuction.bids[0];
          }

          return updatedAuction;
        }
        return auction;
      });
    });
  };

  const connectWallet = async () => {
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (provider) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏛️ Farcaster Auction</h1>
        <div className="header-actions">
          {!isConnected && (
            <button onClick={connectWallet} className="connect-btn">
              Connect Wallet
            </button>
          )}
          {isConnected && user && (
            <div className="user-info">
              <span>@{user.username}</span>
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <button 
          onClick={() => setView('list')} 
          className={view === 'list' ? 'active' : ''}
        >
          Auctions
        </button>
        <button 
          onClick={() => setView('create')} 
          className={view === 'create' ? 'active' : ''}
        >
          Create Auction
        </button>
      </nav>

      <main className="app-main">
        {view === 'list' && (
          <AuctionList 
            auctions={auctions} 
            onBid={placeBid}
            user={user}
            isConnected={isConnected}
          />
        )}
        {view === 'create' && (
          <CreateAuction 
            onCreate={createAuction}
            user={user}
            isConnected={isConnected}
          />
        )}
      </main>
    </div>
  );
}

export default App;

