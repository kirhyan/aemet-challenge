export interface WeatherObservation {
  nombre: string;
  fhora: string;
  temp?: number | null;
  pres?: number | null;
  vel?: number | null;
}

export type Aggregation = "None" | "Hourly" | "Daily" | "Monthly";

export type Measurement = "temp" | "pres" | "vel";

export interface WeatherQuery {
  fechaIni: string;
  fechaFin: string;
  identificacion: string;
  aggregation: Aggregation;
  measurements: Measurement[];
}
