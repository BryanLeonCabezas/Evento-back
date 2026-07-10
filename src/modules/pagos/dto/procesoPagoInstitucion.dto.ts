export interface ProcesoPagoInstitucionDto {
  codPago: string;
  respuesta: string;
  descripcionRespuesta: string;
  idTransaccion: string | null;
  fecha: Date;
  nombreFactura: string;
  emailFactura: string;
  tipoIdFactura: string;
  idFactura: string;
  iva: number;
  valorPago: number;
  valorDescuento: number;
  codItem: string;
}
