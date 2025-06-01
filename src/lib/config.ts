// MongoDB Configuration
export const MONGODB_CONFIG = {
    URI: process.env.MONGODB_URI!,
    DB_NAME: process.env.DB_NAME || 'feedback_app',
    COLLECTION_NAME: process.env.COLLECTION_NAME || 'feedbacks'
}

// Feedback Configuration
export const FEEDBACK_CONFIG = {
    MAX_LENGTH: 1000,
    RATE_LIMIT_MINUTES: 5,
    PASSWORD: process.env.PASSWORD!
}

// Validation functions
export function validateConfig() {
    const requiredEnvVars = [
        { name: 'MONGODB_URI', value: MONGODB_CONFIG.URI },
        { name: 'PASSWORD', value: FEEDBACK_CONFIG.PASSWORD }
    ]

    const missingVars = requiredEnvVars
        .filter(({ value }) => !value)
        .map(({ name }) => name)

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        )
    }
}
