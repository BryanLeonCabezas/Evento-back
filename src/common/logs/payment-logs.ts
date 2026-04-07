import { AppDataSource } from "../../data-source.js";

export class PaymentLogService {
  static async logTarjetaEvento(data: {
    idCliente?: string;
    email?: string;
    tipoEvento: string;
    status: "OK" | "ERROR";
    statusDetail?: number;
    mensaje?: string;
    response?: unknown;
  }) {
    try {
      await AppDataSource.query(
        `
        INSERT INTO TARJETAS_EVENTOS_LOG
        (
          ID_CLIENTE,
          EMAIL,
          TIPO_EVENTO,
          STATUS,
          STATUS_DETAIL,
          MENSAJE,
          RESPONSE_JSON,
          FECHA_EVENTO
        )
        VALUES
        (
          :1, :2, :3, :4, :5, :6, :7, SYSDATE
        )
        `,
        [
          data.idCliente ?? null,
          data.email ?? null,
          data.tipoEvento,
          data.status,
          data.statusDetail ?? null,
          data.mensaje ?? null,
          data.response ? JSON.stringify(data.response) : null,
        ],
      );
    } catch (error) {
      
    
    }
  }
}
