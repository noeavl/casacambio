import { useMemo, useRef, useState } from 'react';
import { Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import type { Signature } from '../types';
import { buildSignaturePath, cropSignatureStrokes, type SignaturePoint } from '../utils/signature';
import { SignatureStrokesView } from './SignatureCanvas';
import { Button } from './ui';

/**
 * Captura de firma a mano alzada. El lienzo ocupa toda la pantalla
 * disponible (para que el cliente tenga espacio real donde firmar) y los
 * botones quedan aparte, fijos abajo, fuera del área de dibujo.
 */
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
  const insets = useSafeAreaInsets();
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
    const cropped = cropSignatureStrokes(all);
    if (cropped.width === 0) return;
    onSave({ path: buildSignaturePath(cropped.strokes), width: cropped.width, height: cropped.height });
    reset();
  };

  const isEmpty = strokes.length === 0 && liveStroke.length === 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCancel}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.headerAction}>‹ {t('common.cancel')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('operation.signatureTitle')}</Text>
          <Pressable onPress={reset} accessibilityRole="button" hitSlop={8} disabled={isEmpty}>
            <Text style={[styles.headerAction, isEmpty && styles.headerActionDisabled]}>
              {t('operation.signatureClear')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.pad} {...panResponder.panHandlers}>
          {isEmpty ? <Text style={styles.placeholder}>{t('operation.signatureHint')}</Text> : null}
          <SignatureStrokesView strokes={[...strokes, liveStroke]} color={colors.paperText} strokeWidth={3} />
        </View>

        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button label={t('common.cancel')} onPress={handleCancel} variant="outline" style={styles.actionBtn} />
          <Button
            label={t('common.save')}
            onPress={handleSave}
            disabled={isEmpty}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerAction: { ...type_.small, color: colors.accent },
    headerActionDisabled: { color: colors.textDim },
    title: { ...type_.section, color: colors.text },
    pad: {
      flex: 1,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      backgroundColor: colors.paper,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    placeholder: { ...type_.small, color: colors.paperMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    actionBtn: { flex: 1 },
  });
}
