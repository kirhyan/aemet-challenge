import db from "../database/database";
import { AntarcticaObservation } from "../clients/aemetClient";

export function saveObservations(
  stationId: string,
  observations: AntarcticaObservation[],
): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO observations (
      station_id,
      name,
      timestamp,
      temperature,
      pressure,
      wind_speed
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items: AntarcticaObservation[]) => {
    for (const observation of items) {
      insert.run(
        stationId,
        observation.nombre,
        observation.fhora,
        observation.temp,
        observation.pres,
        observation.vel,
      );
    }
  });

  insertMany(observations);
}

export function getObservations(
  stationId: string,
  startDate: string,
  endDate: string,
): AntarcticaObservation[] {
  const rows = db
    .prepare(
      `
      SELECT
        name,
        timestamp,
        temperature,
        pressure,
        wind_speed
      FROM observations
      WHERE station_id = ?
        AND timestamp >= ?
        AND timestamp <= ?
      ORDER BY timestamp ASC
    `,
    )
    .all(stationId, startDate, endDate);

  return rows.map((row) => {
    const observation = row as {
      name: string;
      timestamp: string;
      temperature: number | null;
      pressure: number | null;
      wind_speed: number | null;
    };

    return {
      nombre: observation.name,
      fhora: observation.timestamp,
      temp: observation.temperature ?? 0,
      pres: observation.pressure ?? 0,
      vel: observation.wind_speed ?? 0,
    };
  });
}

export function hasCompleteRange(
  stationId: string,
  startDate: string,
  endDate: string,
): boolean {
  const row = db
    .prepare(
      `
      SELECT
        MIN(timestamp) AS minTimestamp,
        MAX(timestamp) AS maxTimestamp
      FROM observations
      WHERE station_id = ?
        AND timestamp >= ?
        AND timestamp <= ?
    `,
    )
    .get(stationId, startDate, endDate) as {
    minTimestamp: string | null;
    maxTimestamp: string | null;
  };

  if (!row.minTimestamp || !row.maxTimestamp) {
    return false;
  }

  return row.minTimestamp <= startDate && row.maxTimestamp >= endDate;
}
