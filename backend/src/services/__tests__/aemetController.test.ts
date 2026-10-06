import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../server";

describe("GET /api/antartida/datos", () => {
  const baseUrl =
    "/api/antartida/datos/fechaini/2025-08-01T00:00:00UTC/fechafin/2025-08-01T01:00:00UTC";

  it("returns 400 when the station is invalid", async () => {
    const response = await request(app).get(`${baseUrl}/estacion/invalid`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid station",
    });
  });

  it("returns 400 when the date format is invalid", async () => {
    const response = await request(app).get(
      "/api/antartida/datos/fechaini/invalid/fechafin/2025-08-01T01:00:00UTC/estacion/89070",
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid date format",
    });
  });

  it("returns 400 when the start date is after the end date", async () => {
    const response = await request(app).get(
      "/api/antartida/datos/fechaini/2025-08-01T02:00:00UTC/fechafin/2025-08-01T01:00:00UTC/estacion/89070",
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Start date must be before end date",
    });
  });

  it("returns 400 when the aggregation is invalid", async () => {
    const response = await request(app).get(
      `${baseUrl}/estacion/89070?aggregation=Yearly`,
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid aggregation",
    });
  });

  it("returns 400 when the measurement is invalid", async () => {
    const response = await request(app).get(
      `${baseUrl}/estacion/89070?measurements=humidity`,
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid measurement",
    });
  });
});
