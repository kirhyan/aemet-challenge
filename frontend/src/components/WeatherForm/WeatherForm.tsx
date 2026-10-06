import { useState } from "react";
import type {
  Aggregation,
  Measurement,
  WeatherQuery,
} from "../../types/weather";
import styles from "./WeatherForm.module.css";

interface WeatherFormProps {
  station: string;
  onStationChange: (station: string) => void;
  onSubmit: (query: WeatherQuery) => void;
}

export default function WeatherForm({
  station,
  onStationChange,
  onSubmit,
}: WeatherFormProps) {
  const [fechaInicio, setFechaInicio] = useState("2025-08-01T00:00");

  const [fechaFin, setFechaFin] = useState("2025-08-01T01:00");

  const [aggregation, setAggregation] = useState<Aggregation>("None");

  const [measurements, setMeasurements] = useState<Measurement[]>(["temp"]);

  const handleMeasurementChange = (
    measurement: Measurement,
    checked: boolean,
  ) => {
    setMeasurements((current) => {
      if (checked) {
        return current.includes(measurement)
          ? current
          : [...current, measurement];
      }

      return current.filter((item) => item !== measurement);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fechaInicio > fechaFin) {
      alert("Start date must be before end date.");
      return;
    }

    if (measurements.length === 0) {
      alert("Select at least one measurement.");
      return;
    }

    const query: WeatherQuery = {
      fechaIni: fechaInicio,
      fechaFin: fechaFin,
      identificacion: station,
      aggregation,
      measurements,
    };

    onSubmit(query);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="fechaInicio">Start date (Europe/Madrid)</label>

          <input
            id="fechaInicio"
            type="datetime-local"
            value={fechaInicio}
            onChange={(event) => setFechaInicio(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="fechaFin">End date (Europe/Madrid)</label>

          <input
            id="fechaFin"
            type="datetime-local"
            value={fechaFin}
            onChange={(event) => setFechaFin(event.target.value)}
          />
        </div>
      </div>

      <p className={styles.timezoneHint}>
        Dates are interpreted in Europe/Madrid (CET/CEST).
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="station">Station</label>

          <select
            id="station"
            value={station}
            onChange={(event) => onStationChange(event.target.value)}
          >
            <option value="89070">Gabriel de Castilla</option>

            <option value="89064">Juan Carlos I</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="aggregation">Aggregation</label>

          <select
            id="aggregation"
            value={aggregation}
            onChange={(event) =>
              setAggregation(event.target.value as Aggregation)
            }
          >
            <option value="None">None</option>
            <option value="Hourly">Hourly</option>
            <option value="Daily">Daily</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      <fieldset className={styles.measurements}>
        <legend className={styles.legend}>Measurements</legend>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={measurements.includes("temp")}
            onChange={(event) =>
              handleMeasurementChange("temp", event.target.checked)
            }
          />
          Temperature
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={measurements.includes("pres")}
            onChange={(event) =>
              handleMeasurementChange("pres", event.target.checked)
            }
          />
          Pressure
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={measurements.includes("vel")}
            onChange={(event) =>
              handleMeasurementChange("vel", event.target.checked)
            }
          />
          Wind speed
        </label>
      </fieldset>

      <button className={styles.button} type="submit">
        Query weather data
      </button>
    </form>
  );
}
