import { NextRequest, NextResponse } from 'next/server'
import CryptoJS from 'crypto-js'
import { connectToDatabase, getCollection, MongoDBFeedbackDocument, isValidCategory } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const password = searchParams.get('password')
        const searchTerm = searchParams.get('searchTerm')
        const category = searchParams.get('category')
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '20', 10)

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required to decrypt feedback' },
                { status: 400 }
            )
        }

        // Config validation is handled in connectToDatabase()

        const { db } = await connectToDatabase()
        const collection = getCollection(db)

        // Build MongoDB query
        let query: any = {}

        // Category filter
        if (category && category !== 'all') {
            if (!isValidCategory(category)) {
                return NextResponse.json(
                    { error: 'Invalid category' },
                    { status: 400 }
                )
            }
            query.category = category
        }

        // Search functionality will be applied after decryption since the content is encrypted

        const totalCount = await collection.countDocuments(query)
        console.log(`Found ${totalCount} documents matching query:`, query);

        const encryptedFeedbacks = await collection.find(query)
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray() as MongoDBFeedbackDocument[]

        console.log(`Fetched ${encryptedFeedbacks.length} documents from MongoDB.`);

        let decryptedFeedbacks = encryptedFeedbacks.map((feedback: MongoDBFeedbackDocument) => {
            try {
                if (typeof feedback.encrypted_feedback !== 'string') {
                    console.error('Encrypted feedback is not a string:', feedback)
                    return {
                        _id: feedback._id,
                        category: feedback.category,
                        feedback: '[Error: Invalid feedback format]',
                        created_at: feedback.created_at,
                    }
                }

                const bytes = CryptoJS.AES.decrypt(
                    feedback.encrypted_feedback,
                    password
                )
                const decryptedText = bytes.toString(CryptoJS.enc.Utf8)

                if (!decryptedText) {
                    console.warn('Failed to decrypt feedback for item:', feedback._id)
                    return {
                        _id: feedback._id,
                        category: feedback.category,
                        feedback: '[Error: Failed to decrypt feedback]',
                        created_at: feedback.created_at,
                    }
                }

                return {
                    _id: feedback._id,
                    category: feedback.category,
                    feedback: decryptedText,
                    created_at: feedback.created_at,
                }
            } catch (error: any) {
                console.error('Error decrypting feedback item:', feedback._id, error)
                return {
                    _id: feedback._id,
                    category: feedback.category,
                    feedback: `[Error decrypting feedback: ${error.message}]`,
                    created_at: feedback.created_at,
                }
            }
        })

        // Apply search filter if provided
        if (searchTerm) {
            decryptedFeedbacks = decryptedFeedbacks.filter(item => 
                item.feedback.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Recalculate pagination after search filtering
        const startIndex = (page - 1) * limit
        const endIndex = Math.min(startIndex + limit, decryptedFeedbacks.length)
        const paginatedFeedbacks = decryptedFeedbacks.slice(startIndex, endIndex)
        const hasMore = endIndex < decryptedFeedbacks.length

        return NextResponse.json({
            success: true,
            feedbacks: paginatedFeedbacks,
            hasMore: hasMore,
            total: decryptedFeedbacks.length,
            page: page,
            limit: limit
        }, { status: 200 })

    } catch (error) {
        console.error('Error fetching feedbacks:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}