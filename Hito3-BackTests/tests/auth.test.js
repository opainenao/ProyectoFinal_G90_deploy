//const request = require("supertest");

import request from "supertest";
import app from "../../Hito3-Back/server.js";

//const API = "http://localhost:3000";

describe("Autenticacion TEST", () => {

  test("POST /api/auth/register debe registrar un usuario", async () => {

    const data = {
      username: "usuarioprueba",
      email: "user@desafio.cl",
      fono: "12345",
      direccion: "Calle 123",
      contrasena: "1234"
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(data);

    expect(res.statusCode).toBe(201);
  });

  test("POST /api/auth/login debe devolver 401 con credenciales incorrectas", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "user@desafio.cl",
      contrasena: "incorrecta"
    });

  expect(res.statusCode).toBe(401);
  });

  test("POST /api/auth/login debe responder 200", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@desafio.cl",
        contrasena: "1234"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
