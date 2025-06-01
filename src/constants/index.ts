export const FEEDBACK_PAYMENT_ABI = [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "fallback",
      "stateMutability": "payable"
    },
    {
      "type": "receive",
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "hasPaid",
      "inputs": [
        {
          "name": "",
          "type": "address",
          "internalType": "address"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool",
          "internalType": "bool"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pay",
      "inputs": [],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "recordFeedback",
      "inputs": [
        {
          "name": "ipfsCid",
          "type": "string",
          "internalType": "string"
        },
        {
          "name": "category",
          "type": "string",
          "internalType": "string"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "withdraw",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "FeedbackSubmitted",
      "inputs": [
        {
          "name": "ipfsCid",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "category",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "timestamp",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "error",
      "name": "IncorrectAmount",
      "inputs": []
    },
    {
      "type": "error",
      "name": "NotOwner",
      "inputs": []
    }
  ]

export const FEEDBACK_PAYMENT_ADDRESSES: { [chainId: number]: `0x${string}` } = {
   8453: "0x480e979Ff3bfe2D7ADCfa7344F233B80EEa85094", // Base Mainnet
   84532: "0x6508eEc13aC3915b8E1c6a168ca890A6C2D52099" // Base Sepolia Testnet
}

