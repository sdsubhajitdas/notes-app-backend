import request from "supertest";
import { test, describe, expect, afterAll } from "vitest";
import app from "../server";
import db from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

/*
Integration test users

User 1
email: first.user@example.com
password: 1234abcd

User 2
email: second.user@example.com
password: 1234abcd
*/

describe("Authentication routes testing", function () {
  describe("POST /auth/login", function () {
    test("Email not provided", async function () {
      const response = await request(app).post("/api/auth/login").send({
        password: "1234abcd",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Invalid email", async function () {
      const response = await request(app).post("/api/auth/login").send({
        email: "@invalid.email",
        password: "1234abcd",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Password not provided", async function () {
      const response = await request(app).post("/api/auth/login").send({
        email: "first.user@example.com",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("User doesn't exist", async function () {
      const response = await request(app).post("/api/auth/login").send({
        email: "not.found.user@example.com",
        password: "12345678",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(404);
      expect(error.name).toBe("UserNotFoundError");
    }, 10000);

    test("Incorrect password", async function () {
      const response = await request(app).post("/api/auth/login").send({
        email: "first.user@example.com",
        password: "12345678",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(401);
      expect(error.name).toBe("AuthorizationError");
    });

    test("Correct email and password", async function () {
      const email = "first.user@example.com";

      const response = await request(app).post("/api/auth/login").send({
        email,
        password: "1234abcd",
      });
      const responseData = JSON.parse(response.text);

      expect(response.status).toBe(200);
      expect(responseData.email).toBe(email);
    });
  });

  describe("POST /auth/signup", function () {
    test("Email not provided", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        password: "1234abcd",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Invalid email", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        email: "@invalid.email",
        password: "1234abcd",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Password not provided", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        email: "first.user@example.com",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Password length less than 8 characters", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        email: "failing.user@example.com",
        password: "1234567",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("Password length more than 20 characters", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        email: "failing.user@example.com",
        password: "123456789012345678901",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("ValidationError");
    });

    test("User already exists", async function () {
      const response = await request(app).post("/api/auth/signup").send({
        email: "first.user@example.com",
        password: "12345678",
      });
      const error = JSON.parse(response.text);

      expect(response.status).toBe(400);
      expect(error.name).toBe("UserExistsError");
    });

    let randomTestUserId: number;
    test("Valid email and password", async function () {
      var randomNumber = Math.floor(1000 + Math.random() * 9000);
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          email: `testuser${randomNumber}@example.com`,
          password: "1234abcd",
        });

      randomTestUserId = JSON.parse(response.text).id;

      expect(response.status).toBe(201);
    });

    afterAll(async function () {
      await await db.delete(users).where(eq(users.id, randomTestUserId));
    })
  });
});
