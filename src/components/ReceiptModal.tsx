import { useState } from 'react';
import { Alert, Modal, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
    <Modal visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <Text>Recibo</Text>
          {operation ? <Receipt operation={operation} settings={settings} /> : null}
          <Button label="Imprimir" onPress={handlePrint} />
          <Button label="PDF" onPress={handleShare} />
          <Button label="Cerrar" onPress={onClose} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
