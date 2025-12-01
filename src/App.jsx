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
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethProvider, setEthProvider] = useState(null);

  useEffect(() => {
    // Load auctions from localStorage
    const savedAuctions = localStorage.getItem('auctions');
    if (savedAuctions) {
      setAuctions(JSON.parse(savedAuctions));
    }

    const initFarcaster = async () => {
      try {
        // Always try to initialize, even if not in mini app (for preview)
        const inMiniApp = await sdk.isInMiniApp?.();
        
        if (inMiniApp) {
          // Initialize SDK first
          await sdk.actions.ready();
          
          // Get context for Farcaster user info
          const context = await sdk.context.getContext();
          
          if (context?.user) {
            setUser(context.user);
          }

          // Get Ethereum provider for wallet functionality
          try {
            const provider = await sdk.wallet.getEthereumProvider();
            if (provider) {
              setEthProvider(provider);
              
              // Get connected accounts
              const accounts = await provider.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setIsConnected(true);
              }
            }
          } catch (walletError) {
            console.warn('Wallet provider not available:', walletError);
          }
        } else {
          // Not in mini app - allow preview mode
          setUser({ username: 'preview-user', fid: '0' });
          setIsConnected(false);
        }
      } catch (error) {
        console.warn('Farcaster initialization error:', error);
        // Allow app to work in preview mode even if SDK fails
        setUser({ username: 'preview-user', fid: '0' });
        setIsConnected(false);
      }
    };

    initFarcaster();
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
      creatorAddress: walletAddress || null, // Store creator's wallet address
      createdAt: Date.now(),
      bids: [],
      status: 'active'
    };
    setAuctions([newAuction, ...auctions]);
    setView('list');
  };

  const placeBid = async (auctionId, bidAmount, transactionHash) => {
    setAuctions(prevAuctions => {
      return prevAuctions.map(auction => {
        if (auction.id === auctionId && auction.status === 'active') {
          const newBid = {
            id: Date.now().toString(),
            bidder: user?.username || 'Anonymous',
            bidderFid: user?.fid || null,
            bidderAddress: walletAddress,
            amount: bidAmount,
            transactionHash: transactionHash,
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
      const inMiniApp = await sdk.isInMiniApp?.();
      if (!inMiniApp) {
        alert('Please open this app in the Base or Farcaster app to connect your wallet');
        return;
      }

      // Get Ethereum provider
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        alert('Wallet provider not available. Please ensure you are in the Base or Farcaster app.');
        return;
      }

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        // Also get Farcaster user context if available
        try {
          const context = await sdk.context.getContext();
          if (context?.user) {
            setUser(context.user);
          }
        } catch (contextError) {
          console.warn('Could not get user context:', contextError);
        }
      } else {
        alert('No accounts found. Please connect your wallet in the Base or Farcaster app.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        alert('Wallet connection was rejected. Please try again.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
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
          {isConnected && (
            <div className="user-info">
              {user?.username && <span>@{user.username}</span>}
              {walletAddress && (
                <span className="wallet-address">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              )}
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
            walletAddress={walletAddress}
            ethProvider={ethProvider}
          />
        )}
        {view === 'create' && (
          <CreateAuction 
            onCreate={createAuction}
            user={user}
            isConnected={isConnected}
            walletAddress={walletAddress}
          />
        )}
      </main>
    </div>
  );
}

export default App;

