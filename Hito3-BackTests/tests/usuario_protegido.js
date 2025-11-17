import request from "supertest";
const API = "http://localhost:3000"; 

describe("Rutas protegidas /api/users", () => {

  test("Debe devolver 401 si no se envía token", async () => {
    const res = await request(API).get("/api/users");
    expect(res.statusCode).toBe(401);
  });

  test("Debe devolver 200 si el token es válido", async () => {

    // iniciar sesión
    const loginRes = await request(API)
      .post("/api/auth/login")
      .send({
        email: "user@desafio.cl",
        contrasena: "1234"
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("token");

    const token = loginRes.body.token;

    // Ruta protegida
    const res = await request(API)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

});
