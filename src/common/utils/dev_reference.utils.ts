// common/utils/dev-reference.util.ts
import axios from "axios";
import { ProcesoPagoInstitucionDto } from "../../modules/pagos/dto/procesoPagoInstitucion.dto.js";

interface DevReference {
  idUsuario: string;
  nombres: string;
  valorFinal: number;
  itemPago: string;
  codItem: string;
  cupon:any;
  precioOriginal:any,
  descuento:any
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
      codItem: data.codItem,
    });

    if (!response?.codigoPago) {
      throw new Error("La respuesta no contiene codigoPago");
    }

    return response.codigoPago;
  } catch (error) {
    console.error("Error calling urlCodPago:", error);
    throw new Error("Failed to call urlCodPago");
  }
}
export async function procesarPagoInstitucion(
  urlProcesoPago: string,
  data: ProcesoPagoInstitucionDto,
): Promise<boolean> {
  // Si la institución no configuró el endpoint, simplemente continuar
  debugger;
  if (!urlProcesoPago) {
    return true;
  }

  try {
    await axios.post(urlProcesoPago, data);

    return true;
  } catch (error: any) {
    console.error(
      "Error notificando el pago a la institución:",
      error?.response?.data ?? error.message,
    );

    // No lanzar excepción
    return false;
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
