const { ObjectId } = require('mongodb');
const { getUsersCollection, seedUsers } = require('../models/Users');

const { Worker } = require("worker_threads");

console.log("Main thread started");

const worker = new Worker("./controllers/worker.js");

worker.on("message", (result) => {
  console.log("Result:", result);
});

worker.on("exit", () => {
  console.log("Worker finished");
});

console.log("Main thread continues...");

const os = require("os");

console.log(os.cpus().length);

function validateObjectId(id) {
  try {
    return new ObjectId(id);
  } catch (error) {
    return null;
  }
}

async function listUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const collection = getUsersCollection();

    const [data, total] = await Promise.all([
      collection.find().skip(skip).limit(limit).toArray(),
      collection.countDocuments(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const id = validateObjectId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user ID' });

    const collection = getUsersCollection();

    console.log('Fetching user with ID:', id);

    const user = await collection.aggregate([
 {
    $group: { role: "$role", total: { $sum: "$amount" } }
  }    ]).toArray();

    console.log('User found:', user);

    if (!user || user.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, role = 'member', active = true } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const collection = getUsersCollection();
    const result = await collection.insertOne({ name, email, role, active });
    const user = await collection.findOne({ _id: result.insertedId });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = validateObjectId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user ID' });

    const updates = {};
    const allowed = ['name', 'email', 'role', 'active'];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'User not found' });
    res.json(result.value);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = validateObjectId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid user ID' });

    const collection = getUsersCollection();
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
}

async function seedUserData(req, res, next) {
  try {
    const collection = getUsersCollection();
    await collection.deleteMany({});
    const result = await collection.insertMany(seedUsers);
    res.json({ insertedCount: result.insertedCount });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  seedUserData,
};
