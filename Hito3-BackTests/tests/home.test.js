import request from "supertest";

const API = "http://localhost:3000";

describe("Home", () => {
  test("Debe responder 200 con lista de usuarios", async () => {
    const res = await request(API).get("/");
    expect(res.statusCode).toBe(200);
  });
});