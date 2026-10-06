import type { AntarcticaObservation } from "../clients/aemetClient";

export type Aggregation = "Hourly" | "Daily" | "Monthly";

export interface AggregatedObservation {
  nombre: string;
  fhora: Date;
  temp: number | null;
  pres: number | null;
  vel: number | null;
}

const STATION_TIMEZONE = "Antarctica/Palmer";

function getLocalDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: STATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function getGroupKey(date: Date, aggregation: Aggregation): string {
  const local = getLocalDateParts(date);

  if (aggregation === "Hourly") {
    return `${local.year}-${local.month}-${local.day}-${local.hour}`;
  }

  if (aggregation === "Daily") {
    return `${local.year}-${local.month}-${local.day}`;
  }

  return `${local.year}-${local.month}`;
}

export function aggregateData(
  data: AntarcticaObservation[],
  aggregation: Aggregation,
): AggregatedObservation[] {
  const groups = new Map<string, AntarcticaObservation[]>();

  for (const observation of data) {
    const date = new Date(observation.fhora);
    const groupKey = getGroupKey(date, aggregation);

    const group = groups.get(groupKey);

    if (group) {
      group.push(observation);
    } else {
      groups.set(groupKey, [observation]);
    }
  }

  const aggregatedData: AggregatedObservation[] = [];

  for (const [groupKey, observations] of groups) {
    let tempSum = 0;
    let tempCount = 0;
    let presSum = 0;
    let presCount = 0;
    let velSum = 0;
    let velCount = 0;

    for (const observation of observations) {
      if (observation.temp !== null && Number.isFinite(observation.temp)) {
        tempSum += observation.temp;
        tempCount++;
      }

      if (observation.pres !== null && Number.isFinite(observation.pres)) {
        presSum += observation.pres;
        presCount++;
      }

      if (observation.vel !== null && Number.isFinite(observation.vel)) {
        velSum += observation.vel;
        velCount++;
      }
    }

    const firstObservation = observations[0]!;

    aggregatedData.push({
      nombre: firstObservation.nombre,
      fhora: createGroupDate(groupKey, aggregation),
      temp: tempCount > 0 ? Number((tempSum / tempCount).toFixed(1)) : null,
      pres: presCount > 0 ? Number((presSum / presCount).toFixed(1)) : null,
      vel: velCount > 0 ? Number((velSum / velCount).toFixed(1)) : null,
    });
  }

  return aggregatedData;
}

function createGroupDate(groupKey: string, aggregation: Aggregation): Date {
  const parts = groupKey.split("-").map(Number);

  const year = parts[0]!;
  const month = parts[1]!;
  const day = parts[2] ?? 1;
  const hour = parts[3] ?? 0;

  const approximateUtc = Date.UTC(year, month - 1, day, hour);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: STATION_TIMEZONE,
    timeZoneName: "longOffset",
  });

  const formattedParts = formatter.formatToParts(new Date(approximateUtc));

  const timeZoneName = formattedParts.find(
    (part) => part.type === "timeZoneName",
  )?.value;

  const match = timeZoneName?.match(/GMT([+-])(\d{2}):?(\d{2})?/);

  if (!match) {
    return new Date(approximateUtc);
  }

  const sign = match[1] === "+" ? 1 : -1;
  const offsetHours = Number(match[2]);
  const offsetMinutes = Number(match[3] ?? "0");

  const offset = sign * (offsetHours * 60 + offsetMinutes) * 60 * 1000;

  return new Date(approximateUtc - offset);
}
