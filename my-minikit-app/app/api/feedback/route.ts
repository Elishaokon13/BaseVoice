import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const RATE_LIMIT_MINUTES = 5;

export async function POST(req: Request) {
  try {
    const { feedback, category, fid, txHash } = await req.json();

    // Validate input
    if (!feedback || !category || !fid || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('basevoice');
    const feedbackCollection = db.collection('feedback');
    
    // Check rate limit
    const lastFeedback = await feedbackCollection.findOne(
      { fid },
      { sort: { createdAt: -1 } }
    );

    if (lastFeedback) {
      const timeSinceLastFeedback = Date.now() - lastFeedback.createdAt;
      const minutesSinceLastFeedback = timeSinceLastFeedback / (1000 * 60);
      
      if (minutesSinceLastFeedback < RATE_LIMIT_MINUTES) {
        await client.close();
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    // Store feedback
    await feedbackCollection.insertOne({
      feedback,
      category,
      fid,
      txHash,
      createdAt: Date.now()
    });

    await client.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 