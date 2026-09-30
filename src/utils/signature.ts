export interface SignaturePoint {
  x: number;
  y: number;
}

/**
 * Convierte trazos capturados con el dedo (arreglos de puntos) al atributo
 * "d" estándar de un <path> SVG, para poder incrustarlo tal cual en el
 * recibo impreso (HTML) y para guardarlo como texto plano.
 */
export function buildSignaturePath(strokes: SignaturePoint[][]): string {
  return strokes
    .filter((stroke) => stroke.length > 0)
    .map((stroke) => {
      const [first, ...rest] = stroke;
      const move = `M${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
      const lines = rest.map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      return lines ? `${move} ${lines}` : move;
    })
    .join(' ');
}

/** Inverso de buildSignaturePath: separa el atributo "d" de vuelta en trazos de puntos. */
export function parseSignaturePath(path: string): SignaturePoint[][] {
  if (!path) return [];
  const strokes: SignaturePoint[][] = [];
  let current: SignaturePoint[] = [];

  for (const command of path.match(/[ML][^ML]*/g) ?? []) {
    const [x, y] = command
      .slice(1)
      .trim()
      .split(/\s+/)
      .map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    if (command.startsWith('M')) {
      if (current.length > 0) strokes.push(current);
      current = [{ x, y }];
    } else {
      current.push({ x, y });
    }
  }
  if (current.length > 0) strokes.push(current);
  return strokes;
}
