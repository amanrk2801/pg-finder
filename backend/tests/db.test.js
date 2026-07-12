const mongoose = require('mongoose');
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const User = require('../src/models/User');
const PG = require('../src/models/PG');

// Always use a dedicated test database — NEVER the app database.
// The after() hook drops the whole database, so pointing this at the real
// MONGODB_URI would destroy dev/production data.
const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/pg_finder_test';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_TEST_URI);
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
      name: 'Test Admin',
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
      status: 'pending',
    });

    assert.strictEqual(pg.name, 'Green PG');
    assert.strictEqual(pg.adminId.toString(), admin._id.toString());
  });
});
