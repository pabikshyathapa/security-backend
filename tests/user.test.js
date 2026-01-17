const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // make sure your Express app is exported here
const User = require("../models/User");

const testDB = "mongodb://localhost:27017/testdb";

beforeAll(async () => {
  await mongoose.disconnect(); // disconnect if already connected to avoid "openUri()" error
  await mongoose.connect(testDB);
  await User.deleteOne({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

const validUser = {
  name: "Test User",
  email: "test@example.com",
  phone: "9876543210",
  password: "testpassword",
};

describe("Auth: Register & Login", () => {
  test("should fail registration if fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Incomplete" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Missing fields");
  });

  test("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true); // Note: your controller sends `succes` instead of `success`
    expect(res.body.message).toBe("User Registered");
  });

  test("should not register duplicate user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User exists");
  });

  test("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.token).toBeDefined();
  });

  test("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpass" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("should fail login for non-existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nouser@example.com", password: "any" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found");
  });
});
