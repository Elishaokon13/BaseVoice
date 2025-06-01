import { MongoClient } from 'mongodb'

import { MONGODB_CONFIG } from './config'
import { validateConfig } from './config'

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb }
    }

    // Validate all required environment variables
    validateConfig()

    try {
        const client = new MongoClient(MONGODB_CONFIG.URI)
        await client.connect()
        const db = client.db(MONGODB_CONFIG.DB_NAME)

        // Create indexes if they don't exist
        const collection = db.collection(MONGODB_CONFIG.COLLECTION_NAME)
        await Promise.all([
            // Index for sorting by creation date
            collection.createIndex({ created_at: -1 }),
            // Index for category filtering
            collection.createIndex({ category: 1 }),
            // Compound index for rate limiting by wallet address
            collection.createIndex({ wallet_address: 1, created_at: 1 }),
            // Index for wallet address queries
            collection.createIndex({ wallet_address: 1 })
        ])

        console.log('MongoDB indexes created successfully')

        cachedClient = client
        cachedDb = db

        return { client, db }
    } catch (error) {
        console.error('Failed to connect to MongoDB or create indexes:', error)
        throw error
    }
}

export function getCollection(db: any) {
    return db.collection(MONGODB_CONFIG.COLLECTION_NAME)
}

// Types for MongoDB documents
export interface MongoDBFeedbackDocument {
    _id?: string;
    encrypted_feedback: string;
    category: string;
    wallet_address?: string;
    chainId?: number;
    created_at: Date;
}

// Valid categories
export const VALID_CATEGORIES = [
    'speed_performance',
    'ease_of_use',
    'ideas_requests',
    'community_support',
    'developer_experience',
    'other'
] as const

export type ValidCategory = typeof VALID_CATEGORIES[number]

// Validation functions
export function isValidCategory(category: string): category is ValidCategory {
    return VALID_CATEGORIES.includes(category as ValidCategory)
}

export function isValidWalletAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidChainId(chainId: any): boolean {
    return typeof chainId === 'number' && chainId > 0
}
