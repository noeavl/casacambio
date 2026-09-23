import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import type { Customer } from '../types';
import { Screen } from './Screen';
import { Button, Card, Field, Muted } from './ui';

/**
 * Selector de cliente de pantalla completa: elegir "Público en general",
 * un cliente ya registrado, o darlo de alta rápido sin salir del flujo.
 */
export function CustomerPickerModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: Customer | null) => void;
}) {
  const { customers, addCustomer } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const close = () => {
    setAdding(false);
    setName('');
    setPhone('');
    onClose();
  };

  const pick = (customer: Customer | null) => {
    onSelect(customer);
    close();
  };

  const handleQuickAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('customers.alertNameTitle'), t('customers.alertNameRequired'));
      return;
    }
    const created = addCustomer({ name: trimmed, phone: phone.trim(), document: '', notes: '' });
    pick(created);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={close}>
      {adding ? (
        <Screen title={t('customers.newTitle')} onBack={() => setAdding(false)}>
          <Card>
            <View style={styles.form}>
              <Field
                label={t('customers.nameLabel')}
                value={name}
                onChangeText={setName}
                placeholder={t('customers.namePlaceholder')}
              />
              <Field label={t('customers.phoneLabel')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>
          </Card>
          <Button label={t('common.save')} onPress={handleQuickAdd} />
        </Screen>
      ) : (
        <Screen
          title={t('operation.selectCustomer')}
          onBack={close}
          right={
            <Button
              label={t('operation.addCustomerButton')}
              onPress={() => setAdding(true)}
              variant="outline"
              style={styles.addBtn}
            />
          }
        >
          <Pressable onPress={() => pick(null)} accessibilityRole="button">
            <Card style={styles.row}>
              <Text style={styles.rowLabel}>{t('operation.customerPlaceholder')}</Text>
            </Card>
          </Pressable>

          {customers.length === 0 ? (
            <Muted style={styles.empty}>{t('customers.emptyHint')}</Muted>
          ) : (
            customers.map((customer) => (
              <Pressable key={customer.id} onPress={() => pick(customer)} accessibilityRole="button">
                <Card style={styles.row}>
                  <Text style={styles.rowLabel}>{customer.name}</Text>
                  {customer.phone ? <Muted>{customer.phone}</Muted> : null}
                </Card>
              </Pressable>
            ))
          )}
        </Screen>
      )}
    </Modal>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    addBtn: { height: 36, paddingHorizontal: spacing.md },
    row: { gap: 2 },
    rowLabel: { ...type_.body, color: colors.text },
    empty: { textAlign: 'center' },
    form: { gap: spacing.lg },
  });
}
