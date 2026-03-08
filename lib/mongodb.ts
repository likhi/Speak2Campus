import { MongoClient, Db } from 'mongodb';

// Hardcoded MongoDB connection - CHANGE THIS if needed
const MONGODB_URI = 'mongodb+srv://dslikhitha08_db_user:iv4wTb6ZT0Y7tuFd@sctmca.x2ntymk.mongodb.net/speak2campus?retryWrites=true&w=majority';
const DATABASE_NAME = 'speak2campus';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isConnecting = false;

export async function connectToDatabase() {
  // Return existing valid connection
  if (cachedClient) {
    try {
      await cachedClient.db('admin').command({ ping: 1 });
      console.log('[v0] Using cached MongoDB connection');
      return cachedDb;
    } catch (error) {
      console.log('[v0] Cached connection invalid, reconnecting...');
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    let retries = 0;
    while (isConnecting && retries < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }
    if (cachedDb) return cachedDb;
  }

  isConnecting = true;

  try {
    console.log('[v0] Connecting to MongoDB...');
    
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });

    await client.connect();
    
    // Test connection
    await client.db('admin').command({ ping: 1 });
    console.log('[v0] MongoDB connected successfully');

    cachedClient = client;
    cachedDb = client.db(DATABASE_NAME);

    // Create collections if they don't exist
    try {
      const collections = await cachedDb.listCollections().toArray();
      const collectionNames = collections.map((c) => c.name);

      const requiredCollections = ['faculty', 'locations', 'events', 'timetable'];
      for (const colName of requiredCollections) {
        if (!collectionNames.includes(colName)) {
          await cachedDb.createCollection(colName);
          console.log(`[v0] Created collection: ${colName}`);
        }
      }
    } catch (error) {
      console.warn('[v0] Warning: Could not initialize collections:', error);
    }

    return cachedDb;
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error);
    cachedClient = null;
    cachedDb = null;
    throw new Error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    isConnecting = false;
  }
}

export async function getDatabase(): Promise<Db> {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to get database connection');
  }
  return db;
}

export function closeDatabase() {
  if (cachedClient) {
    cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
