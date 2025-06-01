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
- **Encryption**: CryptoJS (AES)
- **Authentication**: Wallet Connect

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

## License

MIT
