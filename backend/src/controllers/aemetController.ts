import { Request, Response } from "express";
import {
  Aggregation,
  GetAntarticaDataOptions,
  Measurement,
  getAntarticaData as getAntarticaDataService,
} from "../services/aemetService";

const validStations = ["89064", "89070"];
const validAggregations = ["None", "Hourly", "Daily", "Monthly"];
const validMeasurements = ["temp", "pres", "vel"];

const aemetDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}UTC$/;

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString.replace("UTC", "Z"));

  return !Number.isNaN(date.getTime());
}

export async function getAntarticaData(
  req: Request<{
    fechaIni: string;
    fechaFin: string;
    identificacion: string;
  }>,
  res: Response,
) {
  const { fechaIni, fechaFin, identificacion } = req.params;
  const { aggregation, measurements } = req.query;

  const parsedMeasurements =
    typeof measurements === "string"
      ? (measurements.split(",") as Measurement[])
      : undefined;

  const parsedAggregation =
    typeof aggregation === "string" && validAggregations.includes(aggregation)
      ? (aggregation as Aggregation)
      : undefined;

  if (!fechaIni || !fechaFin || !identificacion) {
    return res.status(400).json({
      error: "Missing required parameters",
    });
  }
  if (!validStations.includes(identificacion)) {
    return res.status(400).json({
      error: "Invalid station",
    });
  }

  if (!aemetDateRegex.test(fechaIni) || !aemetDateRegex.test(fechaFin)) {
    return res.status(400).json({
      error: "Invalid date format",
    });
  }

  if (!isValidDate(fechaIni) || !isValidDate(fechaFin)) {
    return res.status(400).json({
      error: "Invalid date",
    });
  }

  if (
    typeof aggregation === "string" &&
    !validAggregations.includes(aggregation)
  ) {
    return res.status(400).json({
      error: "Invalid aggregation",
    });
  }

  if (
    parsedMeasurements &&
    !parsedMeasurements.every((measurement) =>
      validMeasurements.includes(measurement),
    )
  ) {
    return res.status(400).json({
      error: "Invalid measurement",
    });
  }

  const startDate = new Date(fechaIni.replace("UTC", "Z"));
  const endDate = new Date(fechaFin.replace("UTC", "Z"));
  if (startDate > endDate) {
    return res.status(400).json({
      error: "Start date must be before end date",
    });
  }

  try {
    const options: GetAntarticaDataOptions = {
      fechaIni,
      fechaFin,
      identificacion,
    };

    if (parsedAggregation) {
      options.aggregation = parsedAggregation;
    }

    if (parsedMeasurements) {
      options.measurements = parsedMeasurements;
    }

    const data = await getAntarticaDataService(options);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
