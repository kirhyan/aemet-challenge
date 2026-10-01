interface AntarcticaObservation {
  nombre: string;
  fhora: string;
  temp: number;
  pres: number;
  vel: number;
}

const AEMET_BASE_URL = "https://opendata.aemet.es/opendata/api";

const apiKey: string =
  process.env.AEMET_API_KEY ??
  (() => {
    throw new Error("AEMET_API_KEY is not configured");
  })();

export class AemetClient {
  async getAntarticaData(
    fechaIni: string,
    fechaFin: string,
    identificacion: string,
  ): Promise<AntarcticaObservation[]> {
    const endpoint = `antartida/datos/fechaini/${fechaIni}/fechafin/${fechaFin}/estacion/${identificacion}`;
    const url = new URL(`${AEMET_BASE_URL}/${endpoint}`);

    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`AEMET request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.estado !== 200 || !data.datos) {
      throw new Error(`AEMET API returned an error: ${data.descripcion}`);
    }

    const dataUrl = data.datos;

    const res = await fetch(dataUrl);

    if (!res.ok) {
      throw new Error(`AEMET data failed with status ${res.status}`);
    }
    const aemetData = await res.json();

    return aemetData;
  }
}
