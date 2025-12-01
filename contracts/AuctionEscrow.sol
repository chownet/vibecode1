// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuctionEscrow
 * @dev Smart contract for managing auction bids with escrow functionality
 * Holds funds until auction ends, returns funds to outbid users, transfers to seller on close
 */
contract AuctionEscrow {
    struct Auction {
        address seller;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        uint256 autoAcceptPrice; // 0 means no auto-accept
        bool isActive;
        bool isClosed;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => Bid)) public bids; // auctionId => bidder => Bid
    mapping(uint256 => address[]) public bidders; // auctionId => list of bidders
    mapping(address => uint256) public pendingRefunds; // bidder => total refundable amount

    uint256 public auctionCounter;
    address public owner;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 endTime, uint256 autoAcceptPrice);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionClosed(uint256 indexed auctionId, address indexed winner, uint256 finalBid);
    event FundsWithdrawn(address indexed seller, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new auction
     * @param endTime Unix timestamp when auction ends
     * @param autoAcceptPrice Price that automatically closes auction (0 = no auto-accept)
     */
    function createAuction(uint256 endTime, uint256 autoAcceptPrice) external returns (uint256) {
        require(endTime > block.timestamp, "End time must be in the future");
        
        auctionCounter++;
        uint256 auctionId = auctionCounter;
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            endTime: endTime,
            highestBid: 0,
            highestBidder: address(0),
            autoAcceptPrice: autoAcceptPrice,
            isActive: true,
            isClosed: false
        });

        emit AuctionCreated(auctionId, msg.sender, endTime, autoAcceptPrice);
        return auctionId;
    }

    /**
     * @dev Place a bid on an auction
     * @param auctionId The auction to bid on
     */
    function placeBid(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];
        
        require(auction.isActive && !auction.isClosed, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > 0, "Bid amount must be greater than 0");
        require(msg.value > auction.highestBid, "Bid must be higher than current highest bid");

        // Refund previous highest bidder if exists
        if (auction.highestBidder != address(0) && auction.highestBid > 0) {
            pendingRefunds[auction.highestBidder] += auction.highestBid;
            bids[auctionId][auction.highestBidder].refunded = false; // Mark for refund
        }

        // Record new bid
        if (bids[auctionId][msg.sender].amount == 0) {
            // First bid from this address
            bidders[auctionId].push(msg.sender);
        }
        
        bids[auctionId][msg.sender] = Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            refunded: false
        });

        // Update auction
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);

        // Check if auto-accept price is reached
        if (auction.autoAcceptPrice > 0 && msg.value >= auction.autoAcceptPrice) {
            _closeAuction(auctionId);
        }
    }

    /**
     * @dev Close an auction (can be called by anyone after end time)
     * @param auctionId The auction to close
     */
    function closeAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive && !auction.isClosed, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        
        _closeAuction(auctionId);
    }

    /**
     * @dev Internal function to close an auction
     */
    function _closeAuction(uint256 auctionId) internal {
        Auction storage auction = auctions[auctionId];
        auction.isActive = false;
        auction.isClosed = true;

        // Refund all bidders except the winner
        address[] memory allBidders = bidders[auctionId];
        for (uint256 i = 0; i < allBidders.length; i++) {
            address bidder = allBidders[i];
            Bid storage bid = bids[auctionId][bidder];
            
            if (bidder != auction.highestBidder && bid.amount > 0 && !bid.refunded) {
                pendingRefunds[bidder] += bid.amount;
                bid.refunded = true;
            }
        }

        // Transfer winning bid to seller
        if (auction.highestBid > 0 && auction.highestBidder != address(0)) {
            (bool success, ) = auction.seller.call{value: auction.highestBid}("");
            require(success, "Transfer to seller failed");
        }

        emit AuctionClosed(auctionId, auction.highestBidder, auction.highestBid);
    }

    /**
     * @dev Allow users to withdraw their refunded bids
     */
    function withdrawRefund() external {
        uint256 amount = pendingRefunds[msg.sender];
        require(amount > 0, "No refunds available");

        pendingRefunds[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund transfer failed");
    }

    /**
     * @dev Get auction details
     */
    function getAuction(uint256 auctionId) external view returns (
        address seller,
        uint256 endTime,
        uint256 highestBid,
        address highestBidder,
        uint256 autoAcceptPrice,
        bool isActive,
        bool isClosed
    ) {
        Auction memory auction = auctions[auctionId];
        return (
            auction.seller,
            auction.endTime,
            auction.highestBid,
            auction.highestBidder,
            auction.autoAcceptPrice,
            auction.isActive,
            auction.isClosed
        );
    }

    /**
     * @dev Get bid details for a specific auction and bidder
     */
    function getBid(uint256 auctionId, address bidder) external view returns (
        address bidderAddress,
        uint256 amount,
        uint256 timestamp,
        bool refunded
    ) {
        Bid memory bid = bids[auctionId][bidder];
        return (bid.bidder, bid.amount, bid.timestamp, bid.refunded);
    }

    /**
     * @dev Get all bidders for an auction
     */
    function getBidders(uint256 auctionId) external view returns (address[] memory) {
        return bidders[auctionId];
    }

    /**
     * @dev Emergency function to withdraw contract balance (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Emergency withdraw failed");
    }
}

