import { AntarcticaObservation, AemetClient } from "../clients/aemetClient";
const aemetClient = new AemetClient();

export type Aggregation = "None" | "Hourly" | "Daily" | "Monthly";

export type Measurement = "temp" | "pres" | "vel";

interface AggregatedObservation {
  nombre: string;
  fhora: string;
  temp?: number | null;
  pres?: number | null;
  vel?: number | null;
}

export interface GetAntarticaDataOptions {
  fechaIni: string;
  fechaFin: string;
  identificacion: string;
  aggregation?: Aggregation;
  measurements?: Measurement[];
}

function toMadridTime(dateString: string): string {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  const offset = values.timeZoneName?.replace("GMT", "") ?? "+00:00";

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}${offset}`;
}

export async function getAntarticaData(options: GetAntarticaDataOptions) {
  const fechaIni = options.fechaIni;
  const fechaFin = options.fechaFin;
  const identificacion = options.identificacion;

  const data = await aemetClient.getAntarticaData(
    fechaIni,
    fechaFin,
    identificacion,
  );

  let processedData: AntarcticaObservation[] | AggregatedObservation[] = data;

  if (options.aggregation && options.aggregation !== "None") {
    processedData = aggregateData(data, options.aggregation);
  }

  if (!options.measurements || options.measurements.length === 0) {
    return processedData.map((observation) => ({
      ...observation,
      fhora: toMadridTime(observation.fhora),
    }));
  }

  const filteredData = processedData.map((observation) => {
    const filteredObservation: AggregatedObservation = {
      nombre: observation.nombre,
      fhora: observation.fhora,
    };

    if (options.measurements?.includes("temp")) {
      filteredObservation.temp = observation.temp;
    }
    if (options.measurements?.includes("pres")) {
      filteredObservation.pres = observation.pres;
    }
    if (options.measurements?.includes("vel")) {
      filteredObservation.vel = observation.vel;
    }

    return filteredObservation;
  });

  return filteredData.map((observation) => ({
    ...observation,
    fhora: toMadridTime(observation.fhora),
  }));
}

function aggregateData(
  data: AntarcticaObservation[],
  aggregation: Exclude<Aggregation, "None">,
): AggregatedObservation[] {
  const groups = new Map<string, AntarcticaObservation[]>();

  for (const observation of data) {
    const date = new Date(observation.fhora);

    if (aggregation === "Hourly") {
      date.setUTCMinutes(0, 0, 0);
    }

    if (aggregation === "Daily") {
      date.setUTCHours(0, 0, 0, 0);
    }

    if (aggregation === "Monthly") {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    }

    const groupKey = date.toISOString();

    const group = groups.get(groupKey);

    if (group) {
      group.push(observation);
    } else {
      groups.set(groupKey, [observation]);
    }
  }

  const aggregatedData: AggregatedObservation[] = [];

  for (const [date, observations] of groups) {
    let tempSum = 0;
    let tempCount = 0;
    let presSum = 0;
    let presCount = 0;
    let velSum = 0;
    let velCount = 0;

    for (const observation of observations) {
      if (Number.isFinite(observation.temp)) {
        tempSum += observation.temp;
        tempCount++;
      }

      if (Number.isFinite(observation.pres)) {
        presSum += observation.pres;
        presCount++;
      }

      if (Number.isFinite(observation.vel)) {
        velSum += observation.vel;
        velCount++;
      }
    }

    const avgTemp =
      tempCount > 0 ? Number((tempSum / tempCount).toFixed(1)) : null;

    const avgPres =
      presCount > 0 ? Number((presSum / presCount).toFixed(1)) : null;

    const avgVel = velCount > 0 ? Number((velSum / velCount).toFixed(1)) : null;

    aggregatedData.push({
      nombre: observations[0]!.nombre,
      fhora: date,
      temp: avgTemp,
      pres: avgPres,
      vel: avgVel,
    });
  }

  return aggregatedData;
}
