# BaseVoice

BaseVoice is a decentralized feedback platform built on the Base network that allows users to submit encrypted feedback while maintaining their privacy through end-to-end encryption.

## Features

- **End-to-End Encryption**: All feedback is encrypted using AES encryption before being stored
- **Blockchain Integration**: Built on the Base network with wallet connectivity
- **Privacy-First**: User feedback is securely encrypted and cannot be read without proper authorization
- **Category-Based Feedback**: Submit feedback in various categories:
  - Speed & Performance
  - Ease of Use
  - Ideas & Requests
  - Community Support
  - Developer Experience
  - Other

## Technical Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Blockchain**: Base Network
- **Smart Contract**: Solidity with Foundry
- **Encryption**: CryptoJS (AES)
- **Authentication**: Wallet Connect

## Smart Contract Setup

The project includes a Foundry-based smart contract for handling feedback payments. To work with the smart contract:

1. Navigate to the smart contract directory:
   ```bash
   cd foundry-app
   ```

2. Install Foundry dependencies:
   ```bash
   forge install
   ```

3. Build the contract:
   ```bash
   forge build
   ```

4. Run tests:
   ```bash
   forge test
   ```

5. Deploy to Base network:
   ```bash
   forge script script/FeedbackPayment.s.sol:DeployScript --rpc-url <base_rpc_url> --private-key <your_private_key>
   ```

   Note: The contract requires a minimum payment of 0.0003935 ETH for feedback submission.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   PASSWORD=your_encryption_password
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser

## Usage

1. Connect your wallet (must be on Base network)
2. Select a feedback category
3. Write your feedback (max 1000 characters)
4. Submit feedback (requires a small transaction fee)
5. Your feedback will be encrypted and stored securely

## Rate Limiting

To prevent spam, users must wait 5 minutes between feedback submissions from the same wallet address.

## Security

- All feedback is encrypted using AES encryption before storage
- Wallet addresses are stored for rate limiting but not publicly displayed
- Smart contract integration ensures proper payment verification

