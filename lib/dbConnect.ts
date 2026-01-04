import mongoose from "mongoose"

// MONGODB_URI check moved inside dbConnect function

interface MongooseGlobal {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
}

// Properly extend global type
declare global {
    var mongooseGlobal: MongooseGlobal | undefined
}

let cached = globalThis.mongooseGlobal

if (!cached) {
    cached = globalThis.mongooseGlobal = { conn: null, promise: null }
}

// Ensure cached is always defined
cached = cached ?? { conn: null, promise: null }
globalThis.mongooseGlobal = cached

async function dbConnect(): Promise<typeof mongoose> {
    const MONGODB_URI = process.env.MONGODB_URI as string

    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable")
    }

    if (!cached) {
        throw new Error("Mongoose cache is not initialized")
    }
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        const opts = {
            dbName: "cameronhighlandstours",
            bufferCommands: false,
            // Add connection timeouts for Vercel
            serverSelectionTimeoutMS: 5000, // 5 seconds
            socketTimeoutMS: 45000, // 45 seconds
            connectTimeoutMS: 10000, // 10 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain a minimum of 5 socket connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        }

        cached.promise = mongoose.connect(MONGODB_URI, opts)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        throw error
    }

    return cached.conn
}

export default dbConnect
