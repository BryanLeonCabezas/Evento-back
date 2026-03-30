import { email, success } from "zod";
import { EstadoEventoUsuario } from "../../common/enums/EstadoEventoUsuario.enum.js";
import { AppError } from "../../common/utils/App.error.js";
import { PaymentezProvider } from "../payments/providers/paymentez.js";
import {
	contarInscritos,
	obtenerDatosInstitucion,
	obtenerEvento,
	obtenerPrecioEvento,
	obtenerPublicoEsperado,
	obtenerTarjetaUsuario,
	obtenerUsuario,
	usuarioYaInscrito,
} from "./query.js";
import { eventoUsuarioReposiroty } from "./repository.js";
import { Transactional } from "typeorm-transactional";
import { log } from "console";
import { HistorialEventosXUsuarioDto } from "./dto.js";
import {
	formatLocalDate,
	formatTime,
} from "../../common/utils/ValidateRoutes.util.js";
import { generarCodigoQR } from "../../common/utils/crypto.util.js";
import { ca } from "zod/locales";
import { EventosUsuarios } from "./entity.js";
import { Brackets } from "typeorm";
import { PaymentsService } from "../payments/service.js";
import { PaymentProviderFactory } from "../payments/factory.js";

export class EventoUsuarioService {
	private eventoUsuarioReposiroty = eventoUsuarioReposiroty;

	//private paymentezProvider = new PaymentezProvider();

	private mapToHistorialEventosXUsuarioDto(
		evento: any,
	): HistorialEventosXUsuarioDto {
		return {
			idEvento: evento.IDEVENTO,
			titulo: evento.TITULO,
			fechaEvento: formatLocalDate(evento.FECHAEVENTO),
			horaInicio: formatTime(evento.HORAINICIO),
			horaFin: formatTime(evento.HORAFIN),
			estado: evento.ESTADO as EstadoEventoUsuario,
			imgUrl: evento.IMGURL,
		};
	}

	async suscribirUsuario(
		idEvento: number,
		idUsuario: string,
		estado: EstadoEventoUsuario = EstadoEventoUsuario.SUSCRITO,
		observacion?: string,
		idTarjeta?: number,
	) {
		const manager = this.eventoUsuarioReposiroty.manager;
		return await this.eventoUsuarioReposiroty.manager.transaction(
			async (manager) => {
				const [
					evento,
					institucion,
					publicoEsperado,
					inscritosAlEvento,
					tarjetaUsuario,
					usuario,
					usuarioInscrito,
				] = await Promise.all([
					obtenerEvento(manager, idEvento),
					obtenerDatosInstitucion(manager, idEvento),
					obtenerPublicoEsperado(manager, idEvento),
					contarInscritos(manager, idEvento),
					obtenerTarjetaUsuario(manager, idTarjeta, idUsuario),
					obtenerUsuario(manager, idUsuario),
					usuarioYaInscrito(manager, idEvento, idUsuario),
				]);
				let transaccion: any = null;
				const precioEvento = evento.PRECIO;
				console.log("Usuario encontrado:", usuario);
				console.log("Institución organizadora del evento:", institucion);
				console.log("Evento encontrado:", evento);
				console.log("Precio del evento:", precioEvento);
				console.log("Público esperado para el evento:", publicoEsperado);
				console.log("Número de inscritos al evento:", inscritosAlEvento);
				console.log("Tarjeta del usuario para el evento:", tarjetaUsuario);
				console.log(
					"¿El usuario ya está inscrito en el evento?",
					usuarioInscrito,
				);
				if (!evento) {
					throw new AppError("Evento no encontrado", 404);
				}
				console.log("Evento encontrado:", precioEvento);
				console.log("Precio del evento:", precioEvento);
				console.log("Público esperado para el evento:", publicoEsperado);
				console.log("Número de inscritos al evento:", inscritosAlEvento);
				console.log("Tarjeta del usuario para el evento:", tarjetaUsuario);
				console.log(
					"¿El usuario ya está inscrito en el evento?",
					usuarioInscrito,
				);

				if (usuarioInscrito) {
					throw new AppError("El usuario ya está suscrito a este evento", 400);
				}


				if (inscritosAlEvento.INSCRITOS >= publicoEsperado.PUBLICO_ESPERADO) {
					throw new AppError("El evento ha alcanzado su capacidad máxima", 400);
				}

				let paymentsService: PaymentsService | null = null;

				if (precioEvento > 0) {
					if (
						precioEvento > 0 &&
						(!tarjetaUsuario || Object.keys(tarjetaUsuario).length === 0)
					) {
						throw new AppError(
							"El evento requiere un método de pago válido",
							400,
						);
					}

					const provider = PaymentProviderFactory.create(institucion);
					paymentsService = new PaymentsService(provider);
					 
					const dataDebit = {
						userId: idUsuario,
						cardToken: tarjetaUsuario.TOKEN,
						amount: precioEvento,
						description: `Pago por inscripción al evento ${evento.TITULO}`,
						email: usuario.EMAIL,
					};

					console.log("Datos para el débito:", dataDebit);

					const responsePago = await paymentsService.debitar(dataDebit);
					console.log("Respuesta de Paymentez:", responsePago);
					transaccion = responsePago?.transaction;

					console.log("Respuesta de Paymentez:", responsePago);
					if (!transaccion || transaccion.status_detail !== 3) {
						throw new AppError(
							"No se pudo procesar el pago. Verifica tu método de pago.",
							400,
						);
					}
				}

				try {
					const nuevoRegistro = manager.create(EventosUsuarios, {
						idEvento: { idEvento },
						idCliente: { idCliente: idUsuario },
						estado: EstadoEventoUsuario.SUSCRITO,
						observacion,
						qrToken: generarCodigoQR("TCK"),
					});

					const transaccionId = transaccion?.id ?? null;

					const response = {
						message:
							precioEvento > 0
								? "Pago realizado e inscripción confirmada"
								: "Inscripción confirmada (evento gratuito)",
						data: {
							idEvento,
							nombreEvento: evento.TITULO,
							transaccionId,
						},
						success: true,
					};

					await manager.save(nuevoRegistro);

					return response;
				} catch (error) {
					if (transaccion?.id) {
						try {
							await paymentsService?.reembolsar({
								transactionId: transaccion.id,
								amount: precioEvento,
								moreInfo: true,
							});
							console.log(
								"Reembolso exitoso para transacción:",
								transaccion.id,
							);
						} catch (refundError) {
							// CRÍTICO: el cobro se hizo pero el reembolso falló — requiere revisión manual
							console.error(
								"CRITICO: Reembolso fallido para transacción:",
								transaccion.id,
								refundError,
							);
						}
					}

					throw new AppError(
						"Error al registrar la inscripción. Tu pago ha sido reembolsado.",
						500,
					);
				}
			},
		);
	}

	async eliminarSuscripcion(idEvento: number, idUsuario: string) {
		const result = await this.eventoUsuarioReposiroty.manager
			.createQueryBuilder()
			.update("EVENTOS_USUARIOS")
			.set({ estado: EstadoEventoUsuario.CANCELADO, observacion: "Usuario se desuscribió" })
			.where("ID_CLIENTE = :idCliente", { idCliente: idUsuario })
			.andWhere("ID_EVENTO = :idEvento", { idEvento })
			.andWhere("ESTADO = :estado", { estado: EstadoEventoUsuario.SUSCRITO })
			.execute();

		if (result.affected === 0) {
			throw new AppError("El usuario no está suscrito al evento", 400);
		}

		return { message: "Usuario desuscrito correctamente" };
	}

	async obtenerUsuariosSuscritosXEvento(idEvento: number) {
		if (!idEvento || idEvento <= 0) {
			throw new AppError("ID de evento inválido", 400);
		}
		console.log("idEvento", idEvento);
		const usuarios = await this.eventoUsuarioReposiroty
			.createQueryBuilder("eu")
			.innerJoin("eu.idCliente", "u")
			.innerJoin("eu.idEvento", "e")
			.where("e.idEvento = :idEvento", { idEvento })
			.andWhere("eu.estado = 'A'")
			.select([
				"u.idCliente AS idCliente",
				"u.nombre AS nombre",
				"u.email AS email",
			])
			.getRawMany();

		return {
			total: usuarios.length,
			data: usuarios,
		};
	}

	async obtenerEventosSuscritosXUsuario(idUsuario: string) {
		if (!idUsuario || idUsuario.trim() === "") {
			throw new AppError("ID de usuario inválido", 400);
		}

		const eventos = await this.eventoUsuarioReposiroty
			.createQueryBuilder("eu")
			.innerJoin("eu.idEvento", "e")
			.innerJoin("eu.idCliente", "u")
			.where("u.idCliente = :idCliente", { idCliente: idUsuario })
			.andWhere("eu.estado = 'A'")
			.select([
				"e.idEvento AS idEvento",
				"e.titulo AS titulo",
				"e.fechaEvento AS fechaEvento",
			])
			.getRawMany();

		if (!eventos || eventos.length === 0) {
			return {
				message: "El usuario no tiene eventos suscritos",
				data: [],
			};
		}

		return {
			total: eventos.length,
			data: eventos,
		};
	}

	async obtenerEventosUsuario(idUsuario: string) {
		if (!idUsuario || idUsuario.trim() === "") {
			throw new AppError("ID de usuario inválido", 400);
		}

		const ahora = new Date();

		const proximos = await this.eventoUsuarioReposiroty
			.createQueryBuilder("eu")
			.innerJoin("eu.idEvento", "e")
			.innerJoin("eu.idCliente", "u")
			.where("u.idCliente = :idCliente", { idCliente: idUsuario })
			.andWhere("eu.estado = :estado", { estado: EstadoEventoUsuario.SUSCRITO })
			.andWhere("e.horaFin > SYSDATE")
			.select([
				"e.idEvento AS idEvento",
				"e.titulo AS titulo",
				"e.fechaEvento AS fechaEvento",
				"e.horaInicio AS horaInicio",
				"e.horaFin AS horaFin",
				"e.imagenUrl AS imgUrl",
				"eu.estado AS estado",
			])
			.orderBy("e.horaInicio", "ASC")
			.getRawMany();

		const historial = await this.eventoUsuarioReposiroty
			.createQueryBuilder("eu")
			.innerJoin("eu.idEvento", "e")
			.innerJoin("eu.idCliente", "u")
			.where("u.idCliente = :idCliente", { idCliente: idUsuario })
			.andWhere(
				new Brackets((qb) => {
					qb.where("eu.estado IN (:...estados)", {
						estados: [EstadoEventoUsuario.ASISTIO, EstadoEventoUsuario.NO_ASISTIO, EstadoEventoUsuario.CANCELADO],
					}).orWhere("eu.estado = :suscrito AND e.horaFin <= SYSDATE", {
						suscrito: EstadoEventoUsuario.SUSCRITO,
					});
				})
			)
			.select([
				"e.idEvento AS idEvento",
				"e.titulo AS titulo",
				"e.fechaEvento AS fechaEvento",
				"e.horaInicio AS horaInicio",
				"e.horaFin AS horaFin",
				"e.imagenUrl AS imgUrl",
				"eu.estado AS estado",
				"eu.asistio AS asistio",
			])
			.orderBy("e.horaInicio", "DESC")
			.getRawMany();

		return {
			proximos: proximos.map((e) => ({
				...this.mapToHistorialEventosXUsuarioDto(e),
				tiempoRestante: this.calcularTiempoRestante(new Date(e.HORAINICIO)),
			})),
			historial: historial.map((e) => ({
				...this.mapToHistorialEventosXUsuarioDto(e),
				estadoTexto:
					e.ASISTIO === true ? "Asistió" :
						e.ESTADO === EstadoEventoUsuario.CANCELADO ? "Cancelado" :
							"No asistió",
			})),
		};
	}

	private calcularTiempoRestante = (fechaEvento: Date): string => {
		const ahora = new Date();
		const diffMs = fechaEvento.getTime() - ahora.getTime();

		if (diffMs <= 0) return "Ahora";

		// Comparar por fecha de calendario (sin hora)
		const hoyCalendario = new Date(
			ahora.getFullYear(),
			ahora.getMonth(),
			ahora.getDate(),
		);
		const eventoCalendario = new Date(
			fechaEvento.getFullYear(),
			fechaEvento.getMonth(),
			fechaEvento.getDate(),
		);
		const diasCalendario = Math.round(
			(eventoCalendario.getTime() - hoyCalendario.getTime()) /
			(1000 * 60 * 60 * 24),
		);

		if (diasCalendario > 1) return `En ${diasCalendario} días`;
		if (diasCalendario === 1) return "Mañana";

		// Solo si es hoy, calcular horas/minutos
		const horas = Math.floor(diffMs / (1000 * 60 * 60));
		const minutos = Math.floor(diffMs / (1000 * 60));

		if (horas > 1) return `En ${horas} horas`;
		if (horas === 1) return "En 1 hora";
		if (minutos > 1) return `En ${minutos} minutos`;

		return "En breve";
	};
}
