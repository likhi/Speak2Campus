import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let isConnecting = false;

export async function getMongoClient(): Promise<MongoClient> {
  // Return existing valid connection
  if (cachedClient) {
    try {
      await cachedClient.db("admin").command({ ping: 1 });
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    let retries = 0;
    while (isConnecting && retries < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retries++;
    }
    if (cachedClient) return cachedClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("[v0] MONGODB_URI is missing");
    console.error("[v0] Available env vars:", Object.keys(process.env).filter(k => k.includes('MONGO')));
    throw new Error(
      "MONGODB_URI environment variable is not set. Please configure it in .env.local"
    );
  }

  isConnecting = true;
  try {
    console.log("[v0] Connecting to MongoDB...");
    console.log("[v0] URI configured (first 50 chars):", uri.substring(0, 50) + "...");
    
    const client = new MongoClient(uri);
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    cachedClient = client;
    console.log("[v0] MongoDB connected successfully");
    return client;
  } catch (error) {
    cachedClient = null;
    console.error("[v0] MongoDB connection error:", error);
    throw new Error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    isConnecting = false;
  }
}

export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "speak2campus";
  cachedDb = client.db(dbName);

  // Initialize collections if they don't exist
  try {
    const collections = await cachedDb.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const requiredCollections = ["faculty", "locations", "events", "timetable"];
    for (const colName of requiredCollections) {
      if (!collectionNames.includes(colName)) {
        await cachedDb.createCollection(colName);
        console.log(`[v0] Created collection: ${colName}`);
      }
    }
  } catch (error) {
    console.error("[v0] Error initializing collections:", error);
  }

  return cachedDb;
}
