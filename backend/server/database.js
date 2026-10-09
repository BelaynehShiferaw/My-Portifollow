import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyDataFile = path.join(__dirname, 'data', 'db.json');
const localDataFile = path.join(__dirname, 'data', 'local-db.json');
const collectionNames = ['projects', 'skills', 'experience', 'services', 'blogs', 'messages', 'certificates'];
const emptyState = () => ({
  profile: {},
  projects: [],
  skills: [],
  experience: [],
  services: [],
  blogs: [],
  messages: [],
  certificates: []
});

let client;
let database;
let persistenceMode = 'mongodb';
let state = emptyState();
let writeQueue = Promise.resolve();

const normalizeState = (data = {}) => {
  const normalized = { ...emptyState(), ...data };
  collectionNames.forEach((name) => {
    normalized[name] = Array.isArray(normalized[name])
      ? normalized[name].map((item) => ({ ...item, id: String(item.id || randomUUID()) }))
      : [];
  });
  normalized.profile = normalized.profile && typeof normalized.profile === 'object'
    ? normalized.profile
    : {};
  return normalized;
};

const loadCollection = async (name) => {
  const documents = await database.collection(name).find({}).sort({ _order: 1 }).toArray();
  return documents.map(({ _id, _order, ...item }) => item);
};

const saveCollection = async (name, items) => {
  const collection = database.collection(name);
  const operations = items.map((item, index) => ({
    replaceOne: {
      filter: { _id: item.id },
      replacement: { ...item, _id: item.id, _order: index },
      upsert: true
    }
  }));

  if (operations.length) await collection.bulkWrite(operations);
  await collection.deleteMany({ _id: { $nin: items.map((item) => item.id) } });
};

const persistState = async (nextState) => {
  await database.collection('profile').replaceOne(
    { _id: 'profile' },
    { ...nextState.profile, _id: 'profile' },
    { upsert: true }
  );
  await Promise.all(collectionNames.map((name) => saveCollection(name, nextState[name])));
};

const loadState = async () => {
  const [profileDocument, ...collections] = await Promise.all([
    database.collection('profile').findOne({ _id: 'profile' }),
    ...collectionNames.map(loadCollection)
  ]);
  const profile = profileDocument ? { ...profileDocument } : {};
  delete profile._id;
  return normalizeState(Object.fromEntries([
    ['profile', profile],
    ...collectionNames.map((name, index) => [name, collections[index]])
  ]));
};

const loadLegacyState = () => {
  try {
    return normalizeState(JSON.parse(fs.readFileSync(legacyDataFile, 'utf8')));
  } catch (error) {
    console.warn('Legacy JSON data was not available for MongoDB migration:', error.message);
    return emptyState();
  }
};

const loadLocalState = () => {
  if (!fs.existsSync(localDataFile)) return loadLegacyState();

  try {
    return normalizeState(JSON.parse(fs.readFileSync(localDataFile, 'utf8')));
  } catch (error) {
    throw new Error(`Unable to load local portfolio data: ${error.message}`);
  }
};

const persistLocalState = async (nextState) => {
  await fs.promises.mkdir(path.dirname(localDataFile), { recursive: true });
  await fs.promises.writeFile(localDataFile, JSON.stringify(nextState, null, 2), 'utf8');
};

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    state = loadLocalState();
    persistenceMode = 'local';
    console.warn('MONGODB_URI is not configured; using local JSON storage for portfolio data.');
    return;
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGODB_DB || 'belayneh_portfolio');

  const collections = [database.collection('profile'), ...collectionNames.map((name) => database.collection(name))];
  const documentCounts = await Promise.all(collections.map((collection) => collection.countDocuments()));
  if (documentCounts.every((count) => count === 0)) {
    state = loadLegacyState();
    await persistState(state);
    console.log('Imported existing portfolio data into MongoDB.');
  } else {
    state = await loadState();
  }

  console.log(`Connected to MongoDB database "${database.databaseName}".`);
}

export function readDB() {
  return JSON.parse(JSON.stringify(state));
}

export async function writeDB(nextState) {
  const snapshot = normalizeState(JSON.parse(JSON.stringify(nextState)));
  const operation = writeQueue.then(() => (
    persistenceMode === 'mongodb'
      ? persistState(snapshot)
      : persistLocalState(snapshot)
  ));
  writeQueue = operation.catch(() => {});

  try {
    await operation;
    state = snapshot;
    return true;
  } catch (error) {
    console.error('Unable to persist portfolio data:', error.message);
    return false;
  }
}