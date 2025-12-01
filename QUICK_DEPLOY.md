# Quick Deploy - Copy & Paste Guide

## ⚡ Fastest Way to Deploy

### 1. Get Testnet ETH
- Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Connect MetaMask
- Switch to Base Sepolia (Chain ID: 84532)
- Request testnet ETH

### 2. Deploy TestUSDC Token

1. Open: https://remix.ethereum.org
2. Create file: `TestUSDC.sol`
3. Copy this code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestUSDC {
    string public name = "Test USDC";
    string public symbol = "tUSDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        totalSupply = 1000000 * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
}
```

4. Compile: Solidity 0.8.20
5. Deploy: Injected Provider - MetaMask (Base Sepolia)
6. **Copy the deployed address** → `0x...`

### 3. Deploy AuctionEscrow Contract

1. Still in Remix
2. Create file: `AuctionEscrow.sol`
3. Copy code from: `contracts/AuctionEscrow.sol` in your project
4. Compile: Solidity 0.8.20
5. Deploy:
   - In the "Deploy" section, you'll see a field for constructor arguments
   - **Enter your TestUSDC address from Step 2**
   - Click "Deploy"
6. **Copy the deployed address** → `0x...`

### 4. Update Your App

Edit `src/utils/contract.js` and replace these lines:

```javascript
export const CONTRACT_ADDRESS = '0xYourAuctionEscrowAddress';
export const USDC_ADDRESS_TESTNET = '0xYourTestUSDCAddress';
```

### 5. Mint Test USDC

In Remix, find your deployed TestUSDC contract and use the `mint` function:
- Address: Your wallet address
- Amount: `1000000000000` (1 million tUSDC)

**Done!** 🎉 Your contracts are deployed and ready to use!
