import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field, Row, SectionLabel } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { spacing } from '../theme';

/** Datos de acceso del usuario con la sesión iniciada: correo y contraseña. */
export function AccountScreen({ onBack }: { onBack: () => void }) {
  const { currentUser, changePassword } = useApp();
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    if (!newPassword) {
      Alert.alert(t('account.alertTitle'), t('account.alertPasswordRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('account.alertTitle'), t('account.alertPasswordMismatch'));
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert(t('account.alertTitle'), t('account.alertPasswordTooShort'));
      return;
    }

    await changePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert(t('account.savedTitle'), t('account.savedMessage'));
  };

  return (
    <Screen title={t('account.title')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('account.title')}</SectionLabel>
        <Row label={t('account.emailLabel')} value={currentUser?.email ?? ''} />
      </Card>

      <Card>
        <View style={styles.group}>
          <Field
            label={t('account.newPasswordLabel')}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
            secureTextEntry
          />
          <Field
            label={t('account.confirmPasswordLabel')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
            secureTextEntry
          />
        </View>
      </Card>

      <Button label={t('common.save')} onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.lg },
});
