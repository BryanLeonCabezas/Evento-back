// common/utils/dev-reference.util.ts
export function generarDevReference(idEvento: number, idUsuario: string): string {
  return `EVT-${idEvento}-USR-${idUsuario}-${Date.now()}`;
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