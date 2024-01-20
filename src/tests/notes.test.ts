import request from "supertest";
import { test, describe, expect, beforeAll } from "vitest";
import app from "../server";

/*
Integration test users

User 1
email: first.user@example.com
password: 1234abcd

User 2
email: second.user@example.com
password: 1234abcd
*/

let firstUser = {
  email: "first.user@example.com",
  password: "1234abcd",
};

let secondUser = {
  email: "second.user@example.com",
  password: "1234abcd",
};

let testNote = {
  title: "Test Title",
  body: "Test note body",
};

describe("Notes route testing", function () {
  let firstUserAccessToken: string;
  let firstUserId: number;
  let secondUserAccessToken: string;
  let secondUserId: number;
  let testNoteId: number;

  beforeAll(async function () {
    // First User
    let response = await request(app).post("/api/auth/login").send(firstUser);
    const firstUserData = JSON.parse(response.text);
    firstUserAccessToken = firstUserData.accessToken;
    firstUserId = firstUserData.id;

    // Second User
    response = await request(app).post("/api/auth/login").send(secondUser);
    const secondUserData = JSON.parse(response.text);
    secondUserAccessToken = secondUserData.accessToken;
    secondUserId = secondUserData.id;
  });

  describe("GET /notes/", function () {
    test("Unauthorized", async function () {
      let response = await request(app).get("/api/notes/");
      expect(response.status).toBe(401);
    });

    test("Fetch all notes", async function () {
      let response = await request(app)
        .get("/api/notes/")
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(200);
    });
  });

  describe("POST /notes/", function () {
    test("Unauthorized", async function () {
      let response = await request(app).post("/api/notes/");
      expect(response.status).toBe(401);
    });

    test("Note body not provided", async function () {
      let response = await request(app)
        .post("/api/notes/")
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(400);
    });

    test("Create a note", async function () {
      let response = await request(app)
        .post("/api/notes/")
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send(testNote);

      let note = JSON.parse(response.text);
      testNoteId = note.id;
      expect(response.status).toBe(200);
    });
  });

  describe("GET /notes/:noteId", function () {
    test("Unauthorized", async function () {
      let response = await request(app).get(`/api/notes/${testNoteId}`);
      expect(response.status).toBe(401);
    });

    test("Invalid note id", async function () {
      let response = await request(app)
        .get("/api/notes/abcd")
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(400);
    });

    test("Note id not found", async function () {
      let response = await request(app)
        .get("/api/notes/1")
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(404);
    });

    test("Valid note id", async function () {
      let response = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send(testNote);
      expect(response.status).toBe(200);
    });
  });

  describe("POST /notes/share", function () {
    test("Unauthorized", async function () {
      let response = await request(app).post(`/api/notes/share`);
      expect(response.status).toBe(401);
    });

    test("Note id not provided", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ userId: secondUserId });
      expect(response.status).toBe(400);
    });

    test("User id not provided", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: testNoteId });
      expect(response.status).toBe(400);
    });

    test("Sharing note with itself", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: testNoteId, userId: firstUserId });
      expect(response.status).toBe(400);
    });

    test("Note id not found / User doesn't have access to share the note", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: 1, userId: secondUserId });
      expect(response.status).toBe(404);
    });

    test("User id not found", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: testNoteId, userId: -1 });
      expect(response.status).toBe(404);
    });

    test("Share note with second user", async function () {
      let response = await request(app)
        .post(`/api/notes/share`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: testNoteId, userId: secondUserId });
      expect(response.status).toBe(200);
    });

    test("Verify second user can access the note", async function () {
      let response = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ noteId: testNoteId, userId: secondUserId });
      expect(response.status).toBe(200);
      expect(JSON.parse(response.text)).toStrictEqual({
        ...testNote,
        id: testNoteId,
        createdByUserId: firstUserId,
        lastUpdatedByUserId: firstUserId,
      });
    });
  });

  describe("PUT /notes/", function () {
    test("Unauthorized", async function () {
      let response = await request(app).post(`/api/notes/share`);
      expect(response.status).toBe(401);
    });

    test("Note id not provided", async function () {
      let response = await request(app)
        .put(`/api/notes/`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ ...testNote });
      expect(response.status).toBe(400);
    });

    test("Title not provided", async function () {
      let response = await request(app)
        .put(`/api/notes/`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ id: testNoteId, body: testNote.body });
      expect(response.status).toBe(400);
    });

    test("Body not provided", async function () {
      let response = await request(app)
        .put(`/api/notes/`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ id: testNoteId, title: testNote.title });
      expect(response.status).toBe(400);
    });

    test("Note id not found / User doesn't have access to share the note", async function () {
      let response = await request(app)
        .put(`/api/notes/`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`)
        .send({ id: 1, ...testNote });
      expect(response.status).toBe(404);
    });

    test("Verify if \"lastUpdatedByUserId\" property is updated correctly after second user updates the note", async function () {
      let response = await request(app)
        .put(`/api/notes/`)
        .set("Authorization", `Bearer ${secondUserAccessToken}`)
        .send({ id: testNoteId, ...testNote });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.text).lastUpdatedByUserId).toBe(secondUserId);
    });
  });

  describe("DELETE /notes/:noteId", function () {
    test("Unauthorized", async function () {
      let response = await request(app).delete(`/api/notes/${testNoteId}`);
      expect(response.status).toBe(401);
    });

    test("Invalid note id", async function () {
      let response = await request(app)
        .delete("/api/notes/abcd")
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(400);
    });

    test("Note id not found / User doesn't have access to share the note", async function () {
      let response = await request(app)
        .delete(`/api/notes/1`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(404);
    });

    test("Delete note", async function () {
      let response = await request(app)
        .delete(`/api/notes/${testNoteId}`)
        .set("Authorization", `Bearer ${firstUserAccessToken}`);
      expect(response.status).toBe(204);
    });
  })
});
