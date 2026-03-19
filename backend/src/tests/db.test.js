const mongoose = require('mongoose');
const User = require('../models/User');
const PG = require('../models/PG');
const { test, before, after } = require('node:test');
const assert = require('node:assert');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pg_finder_test';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

test('MongoDB Integration: User and PG Models', async (t) => {
  await t.test('Should create a pending admin user', async () => {
    const user = await User.create({
      email: 'testadmin@example.com',
      passwordHash: 'hashed_password',
      type: 'pending_admin',
      name: 'Test Admin'
    });
    
    assert.strictEqual(user.email, 'testadmin@example.com');
    assert.strictEqual(user.type, 'pending_admin');
  });

  await t.test('Should create a PG linked to an admin', async () => {
    const admin = await User.findOne({ email: 'testadmin@example.com' });
    
    const pg = await PG.create({
      name: 'Green PG',
      address: '123 Street',
      rent: 5000,
      adminId: admin._id,
      status: 'pending'
    });

    assert.strictEqual(pg.name, 'Green PG');
    assert.strictEqual(pg.adminId.toString(), admin._id.toString());
  });
});
