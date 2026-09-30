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

/**
 * Recorta los trazos a su cuadro delimitador (con un margen) y los reduce si
 * hacen falta para no rebasar un tamaño máximo. Así, sin importar qué tan
 * grande sea el lienzo donde se capturó (puede ser la pantalla completa), la
 * firma guardada siempre queda del tamaño justo para verse bien en el
 * recibo, sin espacios en blanco de sobra.
 */
export function cropSignatureStrokes(
  strokes: SignaturePoint[][],
  { padding = 12, maxWidth = 280, maxHeight = 120 }: { padding?: number; maxWidth?: number; maxHeight?: number } = {},
): { strokes: SignaturePoint[][]; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    for (const point of stroke) {
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    }
  }
  if (!Number.isFinite(minX)) return { strokes: [], width: 0, height: 0 };

  const rawWidth = Math.max(maxX - minX, 1);
  const rawHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(1, (maxWidth - padding * 2) / rawWidth, (maxHeight - padding * 2) / rawHeight);

  const shifted = strokes.map((stroke) =>
    stroke.map((point) => ({
      x: (point.x - minX) * scale + padding,
      y: (point.y - minY) * scale + padding,
    })),
  );

  return { strokes: shifted, width: rawWidth * scale + padding * 2, height: rawHeight * scale + padding * 2 };
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
