import { PaymentezBrand } from "../enums/brandTarjeta.enum.js";
import { messages } from "./messages.util.js";
import { EntityManager } from "typeorm";

// --------------------------------------
// NOT EMPTY
// --------------------------------------
export const notEmpty = (valor: any, field: string) => {
  if (String(valor ?? "").trim().length === 0) {
    throw messages.notEmpty(field);
  }
};

// --------------------------------------
// REQUIRED
// --------------------------------------
export const required = (
  valor: any,
  field: string,
  location?: "query" | "body" | "params",
) => {
  if (valor === undefined || valor === null) {
    throw messages.required(field);
  }
  notEmpty(valor, field);
};

// --------------------------------------
// JSON
// --------------------------------------
export const isJSON = (valor: any) => {
  try {
    return JSON.parse(valor);
  } catch (err) {
    throw messages.jsonInvalid;
  }
};

// --------------------------------------
// ARRAY
// --------------------------------------
export const isArrayValue = (valor: any, field: string) => {
  if (!Array.isArray(valor)) {
    throw messages.mustBeArray(field);
  }
};

export const notArrayValue = (valor: any, field: string) => {
  if (Array.isArray(valor)) {
    throw messages.mustNotBeArray(field);
  }
};

// --------------------------------------
// STRING
// --------------------------------------
export const isString = (valor: any, field: string) => {
  if (typeof valor !== "string") {
    throw messages.invalidType(field, "string");
  }
};

export const isStringNotEmpty = (valor: any, field: string) => {
  isString(valor, field);
  notEmpty(valor, field);
};

// --------------------------------------
// BOOLEAN
// --------------------------------------
export const isBooleanValue = (valor: any, field: string) => {
  if (typeof valor !== "boolean") {
    throw messages.invalidType(field, "boolean");
  }
};

// --------------------------------------
// NUMBER
// --------------------------------------
export const isNumberValue = (
  valor: any,
  field: string,
  location?: "query" | "params",
) => {
  if (location) valor = Number(valor);

  if (
    valor === null ||
    typeof valor !== "number" ||
    isNaN(valor) ||
    typeof valor === "boolean" ||
    Array.isArray(valor)
  ) {
    throw messages.mustBeNumber(field);
  }
};

// --------------------------------------
// NUMBER COMPARATORS
// --------------------------------------
export const numberGreaterThan = (
  valor: number,
  min: number,
  field: string,
) => {
  if (valor <= min) {
    throw messages.numberGreaterThan(field, min);
  }
};

export const numberLessThan = (valor: number, max: number, field: string) => {
  if (valor >= max) {
    throw messages.numberLessThan(field, max);
  }
};

// --------------------------------------
// LENGTH STRING
// --------------------------------------
export const lengthString = (
  valor: string,
  min: number,
  max: number,
  field: string,
) => {
  if (min === max && valor.length !== min) {
    throw messages.exactLength(field, min);
  }
  if (valor.length < min) throw messages.minLength(field, min);
  if (valor.length > max) throw messages.maxLength(field, max);
};

// --------------------------------------
// ONE WORD
// --------------------------------------
export const isOneWord = (valor: string, field: string) => {
  if (valor.trim().split(" ").length > 1) {
    throw messages.onlyOneWord(field);
  }
};

// --------------------------------------
// OPTION VALIDATION
// --------------------------------------
export const isContains = (lista: any[], valor: any, field: string) => {
  const normalized = lista.map((x) =>
    typeof x === "string" ? x.toUpperCase() : x,
  );

  if (typeof valor === "string") valor = valor.toUpperCase();

  if (!normalized.includes(valor)) {
    throw messages.invalidValue(field, valor);
  }
};

// --------------------------------------
// OBJECT KEYS
// --------------------------------------
export const hasObjectKey = (
  obj: object,
  field: string,
  keys: string[],
  extra: boolean = false,
) => {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
    throw messages.invalidType(field, "object");
  }

  const actualKeys = Object.keys(obj);

  // EXTRA KEYS NO PERMITIDOS
  if (extra) {
    for (const key of actualKeys) {
      if (!keys.includes(key)) {
        throw messages.extraObjectKeys(field, key);
      }
    }
  }

  // FALTAN CAMPOS
  for (const key of keys) {
    if (!actualKeys.includes(key)) {
      throw messages.missingObjectKeys(field);
    }
  }
};

// --------------------------------------
// VALIDAR CÓDIGO EMPRESA EN BD
// --------------------------------------
export const isValidCodigoEmpresa = async (
  em: EntityManager,
  valor: number,
) => {
  const count = await em
    .createQueryBuilder("emp", "e")
    .where("e.codigoEmpresa = :valor", { valor })
    .getCount();

  if (count === 0) {
    throw messages.recordNotFound("Empresa", "codigoEmpresa", valor);
  }
};

export const PaymentezBrandNombre: Record<PaymentezBrand, string> = {
  [PaymentezBrand.VISA]: "VISA",
  [PaymentezBrand.MASTERCARD]: "Mastercard",
  [PaymentezBrand.AMEX]: "American Express",
  [PaymentezBrand.DINERS]: "Diners Club",
  [PaymentezBrand.DISCOVER]: "Discover",
  [PaymentezBrand.MAESTRO]: "Maestro",
};

export const parseFechaLocal: any = (fecha: string) => {
  const [datePart, timePart] = fecha.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
};

export const formatTime = (value: any): string => {

  if (!value) return "";

  const d = new Date(value);

  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");

  return `${hh}:${mm}`;
};

export const  formatLocalDate :any = (d?: Date) =>{
  if (!d) return null;
  const local = new Date(d); // Date ya ajusta a zona local
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0"); // meses 0-11
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
