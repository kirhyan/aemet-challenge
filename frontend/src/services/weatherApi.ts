import type { WeatherObservation, WeatherQuery } from "../types/weather";

const API_URL = "http://localhost:3000";

function madridDateToUtc(dateTime: string): string {
  const [datePart, timePart] = dateTime.split("T");

  const [year, month, day] = datePart.split("-").map(Number);

  const [hour, minute] = timePart.split(":").map(Number);

  const requestedTime = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    timeZoneName: "longOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const getOffset = (timestamp: number): number => {
    const parts = formatter.formatToParts(new Date(timestamp));

    const timeZoneName = parts.find(
      (part) => part.type === "timeZoneName",
    )?.value;

    if (!timeZoneName) {
      return 0;
    }

    const match = timeZoneName.match(/GMT([+-])(\d{2}):?(\d{2})?/);

    if (!match) {
      return 0;
    }

    const sign = match[1] === "+" ? 1 : -1;

    const hours = Number(match[2]);
    const minutes = Number(match[3] ?? "0");

    return sign * (hours * 60 + minutes) * 60 * 1000;
  };

  const offset = getOffset(requestedTime);

  const utcDate = new Date(requestedTime - offset);

  return utcDate.toISOString().replace(".000Z", "UTC");
}

export async function getWeather(
  query: WeatherQuery,
): Promise<WeatherObservation[]> {
  const fechaIni = madridDateToUtc(query.fechaIni);

  const fechaFin = madridDateToUtc(query.fechaFin);

  const params = new URLSearchParams();

  if (query.aggregation !== "None") {
    params.set("aggregation", query.aggregation);
  }

  if (query.measurements.length > 0) {
    params.set("measurements", query.measurements.join(","));
  }

  const queryString = params.toString();

  const url =
    `${API_URL}/api/antartida/datos` +
    `/fechaini/${encodeURIComponent(fechaIni)}` +
    `/fechafin/${encodeURIComponent(fechaFin)}` +
    `/estacion/${encodeURIComponent(query.identificacion)}` +
    `${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    throw new Error(body?.error ?? "Failed to fetch weather data");
  }

  return response.json();
}
