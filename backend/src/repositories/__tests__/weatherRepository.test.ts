import { describe, expect, it } from "vitest";
import {
  hasCompleteRange,
  saveObservations,
} from "../../repositories/weatherRepository";

describe("weatherRepository", () => {
  it("detects a complete 10-minute range", () => {
    saveObservations("test-station", [
      {
        nombre: "Test Station",
        fhora: "2025-08-01T10:00:00Z",
        temp: 1,
        pres: 1000,
        vel: 5,
      },
      {
        nombre: "Test Station",
        fhora: "2025-08-01T10:10:00Z",
        temp: 2,
        pres: 1001,
        vel: 6,
      },
      {
        nombre: "Test Station",
        fhora: "2025-08-01T10:20:00Z",
        temp: 3,
        pres: 1002,
        vel: 7,
      },
    ]);

    expect(
      hasCompleteRange(
        "test-station",
        "2025-08-01T10:00:00Z",
        "2025-08-01T10:20:00Z",
      ),
    ).toBe(true);
  });

  it("detects a range with missing observations", () => {
    saveObservations("test-station-missing", [
      {
        nombre: "Test Station",
        fhora: "2025-08-01T10:00:00Z",
        temp: 1,
        pres: 1000,
        vel: 5,
      },
      {
        nombre: "Test Station",
        fhora: "2025-08-01T10:20:00Z",
        temp: 3,
        pres: 1002,
        vel: 7,
      },
    ]);

    expect(
      hasCompleteRange(
        "test-station-missing",
        "2025-08-01T10:00:00Z",
        "2025-08-01T10:20:00Z",
      ),
    ).toBe(false);
  });

  it("returns false when there is no cached data", () => {
    expect(
      hasCompleteRange(
        "station-without-data",
        "2025-08-01T10:00:00Z",
        "2025-08-01T10:20:00Z",
      ),
    ).toBe(false);
  });
});
