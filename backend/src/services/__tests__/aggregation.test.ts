import { describe, expect, it } from "vitest";
import { aggregateData } from "../aggregation";
import type { AntarcticaObservation } from "../../clients/aemetClient";

const observations: AntarcticaObservation[] = [
  {
    nombre: "Gabriel de Castilla",
    fhora: "2025-08-01T10:00:00Z",
    temp: 0,
    pres: 1000,
    vel: 5,
  },
  {
    nombre: "Gabriel de Castilla",
    fhora: "2025-08-01T10:10:00Z",
    temp: 2,
    pres: 1002,
    vel: 7,
  },
  {
    nombre: "Gabriel de Castilla",
    fhora: "2025-08-01T10:20:00Z",
    temp: 4,
    pres: 1004,
    vel: 9,
  },
];

describe("aggregateData", () => {
  it("aggregates observations by hour", () => {
    const result = aggregateData(observations, "Hourly");

    expect(result).toHaveLength(1);

    expect(result[0]).toMatchObject({
      nombre: "Gabriel de Castilla",
      temp: 2,
      pres: 1002,
      vel: 7,
    });

    expect(result[0]!.fhora.toISOString()).toBe("2025-08-01T10:00:00.000Z");
  });

  it("keeps null when a measurement has no valid values", () => {
    const data: AntarcticaObservation[] = [
      {
        nombre: "Gabriel de Castilla",
        fhora: "2025-08-01T10:00:00Z",
        temp: null,
        pres: 1000,
        vel: null,
      },
    ];

    const result = aggregateData(data, "Hourly");

    expect(result[0]).toMatchObject({
      temp: null,
      pres: 1000,
      vel: null,
    });
  });

  it("aggregates observations by day", () => {
    const data: AntarcticaObservation[] = [
      {
        nombre: "Gabriel de Castilla",
        fhora: "2025-08-01T10:00:00Z",
        temp: 2,
        pres: 1000,
        vel: 4,
      },
      {
        nombre: "Gabriel de Castilla",
        fhora: "2025-08-01T18:00:00Z",
        temp: 6,
        pres: 1004,
        vel: 8,
      },
    ];

    const result = aggregateData(data, "Daily");

    expect(result).toHaveLength(1);
    expect(result[0]!.temp).toBe(4);
    expect(result[0]!.pres).toBe(1002);
    expect(result[0]!.vel).toBe(6);
  });

  it("aggregates daily data using the station timezone", () => {
    const data: AntarcticaObservation[] = [
      {
        nombre: "Gabriel de Castilla",
        fhora: "2025-08-01T02:30:00Z",
        temp: 2,
        pres: 1000,
        vel: 4,
      },
      {
        nombre: "Gabriel de Castilla",
        fhora: "2025-08-01T03:30:00Z",
        temp: 6,
        pres: 1004,
        vel: 8,
      },
    ];

    const result = aggregateData(data, "Daily");

    expect(result).toHaveLength(2);
  });
});
