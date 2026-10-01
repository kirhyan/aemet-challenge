import "dotenv/config";
import express from "express";
import { getAntarticaData } from "./controllers/aemetController";

const app = express();
const port = 3000;

// Health check used to verify that the API is running.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get(
  "/api/antartida/datos/fechaini/:fechaIni/fechafin/:fechaFin/estacion/:identificacion",
  getAntarticaData,
);

app.listen(port, () => {
  console.log("Server running on http://localhost:3000");
  console.log("AEMET key loaded:", Boolean(process.env.AEMET_API_KEY));
});
