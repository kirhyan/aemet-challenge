import { AemetClient } from "../clients/aemetClient";

const aemetClient = new AemetClient();

export async function getAntarticaData(
  fechaIni: string,
  fechaFin: string,
  identificacion: string,
) {
  return aemetClient.getAntarticaData(fechaIni, fechaFin, identificacion);
}
