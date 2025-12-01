import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ethers } from 'ethers';
import AuctionList from './components/AuctionList';
import CreateAuction from './components/CreateAuction';
import * as contractUtils from './utils/contract';
import './App.css';

function App() {
  const [auctions, setAuctions] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [ethProvider, setEthProvider] = useState(null);
  const [pendingRefunds, setPendingRefunds] = useState('0');

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
                
                // Check for pending refunds
                try {
                  const ethersProvider = new ethers.BrowserProvider(provider);
                  const refunds = await contractUtils.getPendingRefunds(ethersProvider, accounts[0]);
                  setPendingRefunds(refunds);
                } catch (error) {
                  console.warn('Could not check pending refunds:', error);
                }
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
    const checkAndCloseAuctions = async () => {
      const now = Date.now();
      const auctionsToClose = [];
      
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
            // If auction has on-chain ID, close it on-chain
            if (auction.onChainId && ethProvider) {
              auctionsToClose.push(auction.onChainId);
            }
            
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

      // Close auctions on-chain
      if (auctionsToClose.length > 0 && ethProvider) {
        const provider = new ethers.BrowserProvider(ethProvider);
        for (const onChainId of auctionsToClose) {
          try {
            await contractUtils.closeAuctionOnChain(provider, onChainId);
          } catch (error) {
            console.warn('Failed to close auction on-chain:', error);
          }
        }
      }
    };

    // Check immediately
    checkAndCloseAuctions();

    // Check every 5 seconds (less frequent to avoid too many contract calls)
    const interval = setInterval(checkAndCloseAuctions, 5000);

    return () => clearInterval(interval);
  }, [auctions.length, ethProvider]);

  const createAuction = async (auctionData) => {
    if (!ethProvider || !walletAddress) {
      alert('Please connect your wallet to create an auction');
      return;
    }

    try {
      // Calculate end time (current time + duration in seconds)
      const endTime = Math.floor(Date.now() / 1000) + (auctionData.durationMinutes * 60);
      
      // Convert autoAcceptPrice from ETH to wei (0 if not set)
      const autoAcceptPrice = auctionData.autoAcceptPrice || 0;

      // Create auction on-chain
      const onChainAuctionId = await contractUtils.createAuctionOnChain(
        new ethers.BrowserProvider(ethProvider),
        endTime,
        autoAcceptPrice
      );

      // Create local auction record
      const newAuction = {
        id: Date.now().toString(),
        onChainId: onChainAuctionId, // Link to on-chain auction
        ...auctionData,
        creator: user?.username || 'Anonymous',
        creatorFid: user?.fid || null,
        creatorAddress: walletAddress,
        createdAt: Date.now(),
        endTime: endTime * 1000, // Convert to milliseconds
        bids: [],
        status: 'active'
      };
      
      setAuctions([newAuction, ...auctions]);
      setView('list');
    } catch (error) {
      console.error('Error creating auction:', error);
      alert('Failed to create auction on-chain: ' + (error.message || 'Unknown error'));
    }
  };

  const placeBid = async (auctionId, bidAmount, transactionHash, onChainAuctionId) => {
    // Update local state
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

    // Sync with on-chain state
    if (onChainAuctionId && ethProvider) {
      try {
        const provider = new ethers.BrowserProvider(ethProvider);
        const auctionData = await contractUtils.getAuctionFromContract(provider, onChainAuctionId);
        if (auctionData && auctionData.isClosed) {
          // Update local state if auction closed on-chain
          setAuctions(prevAuctions => {
            return prevAuctions.map(auction => {
              if (auction.onChainId === onChainAuctionId) {
                return {
                  ...auction,
                  status: 'closed',
                  closedAt: auctionData.endTime * 1000,
                  closedReason: 'time_limit'
                };
              }
              return auction;
            });
          });
        }
      } catch (error) {
        console.warn('Error syncing with contract:', error);
      }
    }
  };

  const withdrawRefunds = async () => {
    if (!ethProvider || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    if (parseFloat(pendingRefunds) === 0) {
      alert('No pending refunds available');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(ethProvider);
      const txHash = await contractUtils.withdrawRefund(provider);
      alert(`Refund withdrawal submitted! Transaction: ${txHash}`);
      
      // Update pending refunds
      const refunds = await contractUtils.getPendingRefunds(provider, walletAddress);
      setPendingRefunds(refunds);
    } catch (error) {
      console.error('Error withdrawing refunds:', error);
      alert('Failed to withdraw refunds: ' + (error.message || 'Unknown error'));
    }
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
        setEthProvider(provider);
        
        // Check for pending refunds
        try {
          const ethersProvider = new ethers.BrowserProvider(provider);
          const refunds = await contractUtils.getPendingRefunds(ethersProvider, accounts[0]);
          setPendingRefunds(refunds);
        } catch (error) {
          console.warn('Could not check pending refunds:', error);
        }
        
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
              {parseFloat(pendingRefunds) > 0 && (
                <button 
                  onClick={withdrawRefunds}
                  className="withdraw-refund-btn"
                  title={`Withdraw ${parseFloat(pendingRefunds).toFixed(4)} ETH in refunds`}
                >
                  💰 {parseFloat(pendingRefunds).toFixed(4)} ETH refunds
                </button>
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

