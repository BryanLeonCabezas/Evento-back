export interface ProcesoPagoInstitucionDto {
  codPago: string;
  respuesta: string;
  descripcionRespuesta: string | null;
  idTransaccion: string | null;
  fecha: Date;
  nombreFactura: string;
  emailFactura: string;
  tipoIdFactura: string;
  idFactura: string;

  incluyeIva: "S" | "N";

  iva: number;
  valorPago: number;
  valorDescuento: number;
  codItem: string | null;
}