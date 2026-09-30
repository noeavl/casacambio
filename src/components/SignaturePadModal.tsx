import { useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, StyleSheet, View } from 'react-native';

import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type Palette } from '../theme';
import type { Signature } from '../types';
import { buildSignaturePath, type SignaturePoint } from '../utils/signature';
import { Screen } from './Screen';
import { SignatureStrokesView } from './SignatureCanvas';
import { Button, Muted } from './ui';

const PAD_WIDTH = 320;
const PAD_HEIGHT = 180;

/** Captura de firma a mano alzada, de pantalla completa, sin librerías de dibujo. */
export function SignaturePadModal({
  visible,
  onCancel,
  onSave,
}: {
  visible: boolean;
  onCancel: () => void;
  onSave: (signature: Signature) => void;
}) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [strokes, setStrokes] = useState<SignaturePoint[][]>([]);
  const [liveStroke, setLiveStroke] = useState<SignaturePoint[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setLiveStroke([{ x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY }]);
      },
      onPanResponderMove: (evt) => {
        const point = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
        setLiveStroke((points) => [...points, point]);
      },
      onPanResponderRelease: () => {
        setLiveStroke((points) => {
          if (points.length > 0) setStrokes((prev) => [...prev, points]);
          return [];
        });
      },
    }),
  ).current;

  const reset = () => {
    setStrokes([]);
    setLiveStroke([]);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleSave = () => {
    const all = liveStroke.length > 0 ? [...strokes, liveStroke] : strokes;
    if (all.length === 0) return;
    onSave({ path: buildSignaturePath(all), width: PAD_WIDTH, height: PAD_HEIGHT });
    reset();
  };

  const isEmpty = strokes.length === 0 && liveStroke.length === 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCancel}>
      <Screen title={t('operation.signatureTitle')} onBack={handleCancel}>
        <Muted style={styles.hint}>{t('operation.signatureHint')}</Muted>

        <View style={styles.padWrap}>
          <View style={styles.pad} {...panResponder.panHandlers}>
            <SignatureStrokesView strokes={[...strokes, liveStroke]} color={colors.paperText} />
          </View>
        </View>

        <Button label={t('operation.signatureClear')} onPress={reset} variant="outline" />
        <Button label={t('common.save')} onPress={handleSave} disabled={isEmpty} />
        <Button label={t('common.cancel')} onPress={handleCancel} variant="ghost" />
      </Screen>
    </Modal>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    hint: { textAlign: 'center', marginBottom: spacing.md },
    padWrap: { alignItems: 'center', marginBottom: spacing.lg },
    pad: {
      width: PAD_WIDTH,
      height: PAD_HEIGHT,
      backgroundColor: colors.paper,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
}
