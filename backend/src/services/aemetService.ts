import { AntarcticaObservation, AemetClient } from "../clients/aemetClient";
import {
  getObservations,
  hasCompleteRange,
  saveObservations,
} from "../repositories/weatherRepository";
import { aggregateData, type AggregatedObservation } from "./aggregation";

const aemetClient = new AemetClient();

export type Aggregation = "None" | "Hourly" | "Daily" | "Monthly";

export type Measurement = "temp" | "pres" | "vel";

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

  const startDate = fechaIni.replace("UTC", "Z");
  const endDate = fechaFin.replace("UTC", "Z");

  let data: AntarcticaObservation[];

  if (hasCompleteRange(identificacion, startDate, endDate)) {
    data = getObservations(identificacion, startDate, endDate);
  } else {
    data = await aemetClient.getAntarticaData(
      fechaIni,
      fechaFin,
      identificacion,
    );

    saveObservations(identificacion, data);
  }

  let processedData: AntarcticaObservation[] | AggregatedObservation[] = data;

  if (options.aggregation && options.aggregation !== "None") {
    processedData = aggregateData(data, options.aggregation);
  }

  if (!options.measurements || options.measurements.length === 0) {
    return processedData.map((observation) => ({
      ...observation,
      fhora: toMadridTime(
        observation.fhora instanceof Date
          ? observation.fhora.toISOString()
          : observation.fhora,
      ),
    }));
  }

  const filteredData = processedData.map((observation) => {
    const filteredObservation: {
      nombre: string;
      fhora: string | Date;
      temp?: number | null;
      pres?: number | null;
      vel?: number | null;
    } = {
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
    fhora: toMadridTime(
      observation.fhora instanceof Date
        ? observation.fhora.toISOString()
        : observation.fhora,
    ),
  }));
}
