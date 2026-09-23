import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../state/ThemeContext';
import { radius, spacing, type as type_, type Palette } from '../theme';
import type { Operation, Settings } from '../types';
import { Button } from './ui';
import { Receipt, receiptHTML } from './Receipt';

export function ReceiptModal({
  operation,
  settings,
  visible,
  onClose,
}: {
  operation: Operation | null;
  settings: Settings;
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const handlePrint = async () => {
    if (!operation || busy) return;
    setBusy(true);
    try {
      await Print.printAsync({ html: receiptHTML(operation, settings) });
    } catch {
      Alert.alert('Impresión', 'No fue posible abrir el diálogo de impresión en este dispositivo.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!operation || busy) return;
    setBusy(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: receiptHTML(operation, settings) });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('Recibo guardado', uri);
      }
    } catch {
      Alert.alert('Recibo', 'No fue posible generar el PDF del recibo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Cerrar recibo" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.grabber} />
          <Text style={styles.heading}>RECIBO</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {operation ? <Receipt operation={operation} settings={settings} /> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Imprimir" onPress={handlePrint} variant="primary" style={styles.action} />
            <Button label="PDF" onPress={handleShare} variant="outline" style={styles.action} />
            <Button label="Cerrar" onPress={onClose} variant="ghost" style={styles.action} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    backdropTap: { flex: 1 },
    sheet: {
      backgroundColor: colors.bg,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderStrong,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      maxHeight: '92%',
      gap: spacing.md,
    },
    grabber: {
      alignSelf: 'center',
      width: 36,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.borderStrong,
    },
    heading: { ...type_.section, color: colors.textDim, textAlign: 'center' },
    scroll: { flexGrow: 0 },
    scrollContent: { paddingBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm },
    action: { flex: 1 },
  });
}
