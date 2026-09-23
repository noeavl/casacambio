import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Screen } from '../components/Screen';
import { Button, Card, Field } from '../components/ui';
import { useApp } from '../state/AppContext';
import { useLanguage } from '../state/LanguageContext';
import { spacing } from '../theme';

/** Datos personales del usuario con la sesión iniciada: nombre y apellido. */
export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const { currentUser, updateProfile } = useApp();
  const { t } = useLanguage();

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '');
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '');

  const handleSave = () => {
    if (!firstName.trim()) {
      Alert.alert(t('profile.savedTitle'), t('profile.alertFirstNameRequired'));
      return;
    }
    updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
    Alert.alert(t('profile.savedTitle'), t('profile.savedMessage'));
  };

  return (
    <Screen title={t('profile.title')} onBack={onBack}>
      <Card>
        <View style={styles.group}>
          <Field label={t('profile.firstNameLabel')} value={firstName} onChangeText={setFirstName} />
          <Field label={t('profile.lastNameLabel')} value={lastName} onChangeText={setLastName} />
        </View>
      </Card>

      <Button label={t('common.save')} onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.lg },
});
