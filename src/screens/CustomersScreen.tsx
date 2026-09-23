import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, EmptyState, Field, Muted } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { useTheme } from '../state/ThemeContext';
import { spacing, type as type_, type Palette } from '../theme';
import type { Customer } from '../types';
import { formatDateTime } from '../utils/format';

interface Draft {
  id: string | null;
  name: string;
  phone: string;
  document: string;
  notes: string;
}

const emptyDraft: Draft = { id: null, name: '', phone: '', document: '', notes: '' };

function toDraft(customer: Customer): Draft {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    document: customer.document,
    notes: customer.notes,
  };
}

/** Módulo de clientes: alta, edición y baja del directorio de clientes. */
export function CustomersScreen() {
  const { customers, addCustomer, updateCustomer, removeCustomer } = useApp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [draft, setDraft] = useState<Draft | null>(null);

  const openNew = () => setDraft({ ...emptyDraft });
  const openEdit = (customer: Customer) => setDraft(toDraft(customer));
  const closeDraft = () => setDraft(null);

  const handleSave = () => {
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      Alert.alert(t('customers.alertNameTitle'), t('customers.alertNameRequired'));
      return;
    }

    const payload = {
      name,
      phone: draft.phone.trim(),
      document: draft.document.trim(),
      notes: draft.notes.trim(),
    };
    if (draft.id) updateCustomer(draft.id, payload);
    else addCustomer(payload);
    closeDraft();
  };

  const handleDelete = () => {
    if (!draft?.id) return;
    const id = draft.id;
    Alert.alert(t('customers.alertDeleteTitle'), t('customers.alertDeleteMessage', { name: draft.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          removeCustomer(id);
          closeDraft();
        },
      },
    ]);
  };

  return (
    <Screen
      title={t('customers.title')}
      subtitle={t('customers.subtitle', { count: customers.length })}
      right={
        <Button
          label={t('customers.newButton')}
          onPress={openNew}
          variant="outline"
          style={styles.headerBtn}
        />
      }
    >
      {customers.length === 0 ? (
        <Card>
          <EmptyState title={t('customers.emptyTitle')} hint={t('customers.emptyHint')} />
          <Button label={t('customers.addButton')} onPress={openNew} />
        </Card>
      ) : (
        customers.map((customer) => (
          <Pressable key={customer.id} onPress={() => openEdit(customer)} accessibilityRole="button">
            <Card style={styles.customerCard}>
              <Text style={styles.customerName}>{customer.name}</Text>
              {customer.phone ? <Text style={styles.customerDetail}>{customer.phone}</Text> : null}
              {customer.document ? <Text style={styles.customerDetail}>{customer.document}</Text> : null}
              <Muted style={styles.registered}>
                {t('customers.registered', { date: formatDateTime(customer.createdAt) })}
              </Muted>
            </Card>
          </Pressable>
        ))
      )}

      <Modal
        visible={draft !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeDraft}
      >
        <Screen title={draft?.id ? t('customers.editTitle') : t('customers.newTitle')} onBack={closeDraft}>
          <Card>
            <View style={styles.form}>
              <Field
                label={t('customers.nameLabel')}
                value={draft?.name ?? ''}
                onChangeText={(text) => setDraft((d) => (d ? { ...d, name: text } : d))}
                placeholder={t('customers.namePlaceholder')}
              />
              <Field
                label={t('customers.phoneLabel')}
                value={draft?.phone ?? ''}
                onChangeText={(text) => setDraft((d) => (d ? { ...d, phone: text } : d))}
                keyboardType="phone-pad"
              />
              <Field
                label={t('customers.documentLabel')}
                value={draft?.document ?? ''}
                onChangeText={(text) => setDraft((d) => (d ? { ...d, document: text } : d))}
                placeholder={t('customers.documentPlaceholder')}
              />
              <Field
                label={t('customers.notesLabel')}
                value={draft?.notes ?? ''}
                onChangeText={(text) => setDraft((d) => (d ? { ...d, notes: text } : d))}
                placeholder={t('customers.notesPlaceholder')}
                multiline
              />
            </View>
          </Card>

          <Button label={t('common.save')} onPress={handleSave} />
          <Button label={t('common.cancel')} onPress={closeDraft} variant="outline" />
          {draft?.id ? (
            <Button label={t('customers.deleteButton')} onPress={handleDelete} variant="danger" />
          ) : null}
        </Screen>
      </Modal>
    </Screen>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    headerBtn: { height: 36, paddingHorizontal: spacing.md },
    customerCard: { gap: 4 },
    customerName: { fontSize: 18, fontWeight: '500', color: colors.text },
    customerDetail: { ...type_.small, color: colors.textMuted },
    registered: { marginTop: spacing.xs },
    form: { gap: spacing.lg },
  });
}
