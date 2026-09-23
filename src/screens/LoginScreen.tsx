import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { spacing } from '../theme';

/** Pantalla de acceso: usuario y contraseña guardados en el dispositivo. */
export function LoginScreen() {
  const { login } = useApp();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      Alert.alert(t('login.alertTitle'), t('login.alertEmpty'));
      return;
    }
    setSubmitting(true);
    const ok = await login(username, password);
    setSubmitting(false);
    if (!ok) {
      Alert.alert(t('login.alertTitle'), t('login.alertInvalid'));
    }
  };

  return (
    <Screen title={t('login.title')} subtitle={t('login.subtitle')} scroll={false}>
      <View style={styles.center}>
        <Card style={styles.card}>
          <View style={styles.group}>
            <Field
              label={t('login.usernameLabel')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Field
              label={t('login.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              secureTextEntry
            />
          </View>
        </Card>
        <Button label={t('login.submitButton')} onPress={handleSubmit} disabled={submitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  card: { gap: 0 },
  group: { gap: spacing.lg },
});
