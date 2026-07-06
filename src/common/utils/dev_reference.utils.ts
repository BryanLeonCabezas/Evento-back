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
  data: DevReference
): string {
  if (!urlCodPago) {
    return `EVT-${idEvento}-USR-${idUsuario}-${Date.now()}`;
  } else {

    const response = await axios.post(urlCodPago, {
      numId: idUsuario,
      nombres: data.nombres,
      valorFinal: data.valorFinal,
      itemPago: data.itemPago,
    });
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
