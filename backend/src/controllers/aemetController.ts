import { Request, Response } from "express";
import { getAntarticaData as getAntarticaDataService } from "../services/aemetService";

const validStations = ["89064", "89070"];

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

  const startDate = new Date(fechaIni.replace("UTC", "Z"));
  const endDate = new Date(fechaFin.replace("UTC", "Z"));
  if (startDate > endDate) {
    return res.status(400).json({
      error: "Start date must be before end date",
    });
  }

  try {
    const data = getAntarticaDataService(fechaIni, fechaFin, identificacion);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
