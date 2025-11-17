export const messages = {
  // ----- BASICOS -----
  required: (field: string) => `El campo '${field}' es obligatorio`,
  notEmpty: (field: string) => `El campo '${field}' no puede estar vacío`,
  invalidType: (field: string, type: string) =>
    `El campo '${field}' debe ser de tipo '${type}'`,
  invalidValue: (field: string, value: any) =>
    `El valor '${value}' no es válido para el campo '${field}'`,

  // ----- JSON -----
  jsonInvalid: "El JSON enviado no es válido",

  // ----- VALIDACIÓN DE CADENAS -----
  minLength: (field: string, min: number) =>
    `El campo '${field}' debe tener al menos ${min} caracteres`,
  maxLength: (field: string, max: number) =>
    `El campo '${field}' no puede tener más de ${max} caracteres`,
  exactLength: (field: string, len: number) =>
    `El campo '${field}' debe tener exactamente ${len} caracteres`,
  onlyOneWord: (field: string) =>
    `El campo '${field}' debe contener solo una palabra`,

  // ----- VALIDACIÓN NUMÉRICA -----
  mustBeNumber: (field: string) =>
    `El campo '${field}' debe ser numérico`,
  numberGreaterThan: (field: string, min: number) =>
    `El campo '${field}' debe ser mayor que ${min}`,
  numberLessThan: (field: string, max: number) =>
    `El campo '${field}' debe ser menor que ${max}`,

  // ----- VALIDACIÓN DE ARREGLOS -----
  mustBeArray: (field: string) =>
    `El campo '${field}' debe ser un arreglo`,
  mustNotBeArray: (field: string) =>
    `El campo '${field}' no debe ser un arreglo`,

  // ----- VALIDACIÓN POR CONTENIDO -----
  notInOptions: (field: string, value: any) =>
    `El valor '${value}' no es válido para el campo '${field}'`,

  // ----- OBJETOS -----
  missingObjectKeys: (field: string) =>
    `El objeto '${field}' no tiene todos los campos obligatorios`,
  extraObjectKeys: (field: string, key: string) =>
    `El objeto '${field}' contiene una propiedad no permitida ('${key}')`,

  // ----- BASE 64 -----
  invalidBase64: (field: string) =>
    `El campo '${field}' no tiene un formato base64 válido`,

  // ----- FECHAS -----
  invalidDateFormat: (field: string, format: string) =>
    `El campo '${field}' no cumple el formato de fecha '${format}'`,
  invalidExpirationDate: (field: string) =>
    `La fecha de caducidad en '${field}' no es válida`,

  // ----- ENTIDADES / BD -----
  recordNotFound: (entity: string, field: string, value: any) =>
    `No se encontró un registro de '${entity}' con '${field}' = ${value}`,
};
