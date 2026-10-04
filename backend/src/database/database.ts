import Database from "better-sqlite3";

const db = new Database("weather.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id TEXT NOT NULL,
    name TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    temperature REAL,
    pressure REAL,
    wind_speed REAL,
    UNIQUE(station_id, timestamp)
  );
`);

export default db;
