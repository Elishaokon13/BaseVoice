import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'

export async function GET() {
    try {
        console.log('Testing MongoDB connection...')
        const { db } = await connectToDatabase()
        
        // Test collection access
        const collection = db.collection('feedbacks')
        const count = await collection.countDocuments()
        
        console.log('Successfully connected to MongoDB!')
        console.log(`Found ${count} documents in the feedbacks collection`)
        
        // Test indexes
        const indexList = await collection.listIndexes().toArray()

        return NextResponse.json({
            success: true,
            message: 'Successfully connected to MongoDB',
            documentCount: count,
            indexes: indexList
        })
    } catch (error: any) {
        console.error('Error connecting to MongoDB:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
