import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { SignaturePoint } from '../utils/signature';

/**
 * Dibuja trazos ya capturados uniendo cada par de puntos con un segmento
 * (un View delgado rotado). React Native no trae primitivas vectoriales
 * (no hay <canvas> ni SVG sin agregar una librería), así que esto evita
 * sumar una dependencia solo para pintar una firma.
 */
export function SignatureStrokesView({
  strokes,
  color,
  strokeWidth = 2,
  style,
}: {
  strokes: SignaturePoint[][];
  color: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const segments = useMemo(() => {
    const items: { key: string; left: number; top: number; width: number; angle: number }[] = [];
    strokes.forEach((stroke, strokeIndex) => {
      if (stroke.length === 1) {
        const point = stroke[0];
        items.push({
          key: `${strokeIndex}-dot`,
          left: point.x - strokeWidth / 2,
          top: point.y - strokeWidth / 2,
          width: strokeWidth,
          angle: 0,
        });
        return;
      }
      for (let i = 0; i < stroke.length - 1; i += 1) {
        const a = stroke[i];
        const b = stroke[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) continue;
        items.push({
          key: `${strokeIndex}-${i}`,
          left: (a.x + b.x) / 2 - length / 2,
          top: (a.y + b.y) / 2 - strokeWidth / 2,
          width: length,
          angle: Math.atan2(dy, dx),
        });
      }
    });
    return items;
  }, [strokes, strokeWidth]);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {segments.map((seg) => (
        <View
          key={seg.key}
          style={{
            position: 'absolute',
            left: seg.left,
            top: seg.top,
            width: Math.max(seg.width, strokeWidth),
            height: strokeWidth,
            borderRadius: strokeWidth / 2,
            backgroundColor: color,
            transform: [{ rotate: `${seg.angle}rad` }],
          }}
        />
      ))}
    </View>
  );
}
