import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { connectToDatabase, getCollection, isValidCategory, isValidWalletAddress, isValidChainId } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const PASSWORD = process.env.PASSWORD!
    // No longer need Pinata or smart contract interaction keys/urls

    if (!PASSWORD) {
      return NextResponse.json(
        { error: 'Password not configured' },
        { status: 500 }
      )
    }

    const { feedback, category, wallet_address, chainId } = await request.json()

    // Validate input
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json(
        { error: 'Feedback must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!category || !isValidCategory(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    if (!wallet_address || !isValidWalletAddress(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    if (chainId && !isValidChainId(chainId)) {
      return NextResponse.json(
        { error: 'ChainId must be a positive number' },
        { status: 400 }
      )
    }

    if (feedback.length > 1000) {
      return NextResponse.json(
        { error: 'Feedback too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Encrypt the feedback
    const encryptedFeedback = CryptoJS.AES.encrypt(feedback, PASSWORD).toString()

    // Connect to MongoDB and store encrypted feedback
    const { db } = await connectToDatabase();
    const collection = getCollection(db);

    // Check if user has already submitted feedback recently
    const recentFeedback = await collection.findOne({
      wallet_address,
      created_at: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes
    })

    if (recentFeedback) {
      return NextResponse.json(
        { error: 'Please wait a few minutes before submitting another feedback' },
        { status: 429 }
      )
    }

    const result = await collection.insertOne({
      encrypted_feedback: encryptedFeedback,
      category: category,
      wallet_address: wallet_address, // Store wallet address for potential reference (not publicly displayed)
      chainId: chainId, // Store chainId for context
      created_at: new Date()
    });

    console.log('Feedback stored in MongoDB with ID:', result.insertedId);

    // Note: We are no longer calling the smart contract's recordFeedback function to avoid contract changes.
    // The on-chain payment verification is still handled on the frontend before allowing submission.

    // Return success response
    return NextResponse.json({ success: true, message: 'Feedback stored successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}