const { MongoClient } = require('mongodb');

let client;
let db;
let usersCollection;

const seedUsers = Array.from({ length: 50 }, (_, index) => ({
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: index % 2 === 0 ? 'member' : 'admin',
  amount: (index + 1) * 10,
  active: index % 3 !== 0,
}));

async function connectDb(uri, dbName) {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
  }
}

function getUsersCollection() {
  if (!usersCollection) {
    throw new Error('Database is not initialized. Call connectDb first.');
  }
  return usersCollection;
}

module.exports = {
  connectDb,
  getUsersCollection,
  seedUsers,
};
