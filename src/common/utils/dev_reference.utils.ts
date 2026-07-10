// common/utils/dev-reference.util.ts
import axios from "axios";

interface DevReference {
  idUsuario: string;
  nombres: string;
  valorFinal: number;
  itemPago: string;
}
export async function generarDevReference(
  idEvento: number,
  idUsuario: string,
  urlCodPago: string,
  data: DevReference,
): Promise<string> {
  if (!urlCodPago) {
    return `EVT-${idEvento}-USR-${idUsuario}-${Date.now()}`;
  }

  try {
    const { data: response } = await axios.post(urlCodPago, {
      numId: idUsuario,
      nombres: data.nombres,
      valorFinal: data.valorFinal,
      itemPago: data.itemPago,
    });

    console.log("Response from urlCodPago:", response);

    if (!response?.codigoPago) {
      throw new Error("La respuesta no contiene codigoPago");
    }

    return response.codigoPago;
  } catch (error) {
    console.error("Error calling urlCodPago:", error);
    throw new Error("Failed to call urlCodPago");
  }
}
export function parsearDevReference(devReference: string) {
  const match = devReference.match(/^EVT-(\d+)-USR-([^-]+)-(\d+)$/);
  if (!match) return null;
  return {
    idEvento: Number(match[1]),
    idUsuario: match[2],
    timestamp: Number(match[3]),
  };
}
