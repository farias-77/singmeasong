import supertest from "supertest";
import app from "../src/app";
import { prisma } from "../src/database";

import recommendationFactory from "./factories/recommendationFacotry";

const server = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Testa POST /recommendations", () => {
  it("Testa com body correto -> deve retornar 201", async () => {
    const recommendation = recommendationFactory();

    const result = await server.post("/recommendations").send(recommendation);

    expect(result.status).toBe(201);
  });

  it("Testa com link que não é do youtube -> deve retornar 422", async () => {
    const recommendation = recommendationFactory();
    recommendation.youtubeLink = "https://google.com";

    const result = await server.post("/recommendations").send(recommendation);

    expect(result.status).toBe(422);
  });

  it("Testa com name duplicado -> deve retornar 409", async () => {
    const recommendation = recommendationFactory();

    await server.post("/recommendations").send(recommendation);
    const result = await server.post("/recommendations").send(recommendation);

    expect(result.status).toBe(409);
  });
});

describe("Testa GET /recommendations", () => {
  it("Testa corretamente -> deve retornar um array as 10 últimas recomendações de música", async () => {
    const recommendation = recommendationFactory();

    await server.post("/recommendations").send(recommendation);
    const result = await server.get("/recommendations").send();
  });
});
