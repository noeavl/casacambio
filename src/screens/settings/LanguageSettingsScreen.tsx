import { Card, SectionLabel, Segmented } from '../../components/ui';
import { Screen } from '../../components/Screen';
import { useLanguage, type LanguagePreference } from '../../state/LanguageContext';

export function LanguageSettingsScreen({ onBack }: { onBack: () => void }) {
  const { preference, setPreference, t } = useLanguage();

  return (
    <Screen title={t('settings.languageSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.languageSection')}</SectionLabel>
        <Segmented<LanguagePreference>
          value={preference}
          onChange={setPreference}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
            { value: 'system', label: t('settings.languageSystem') },
          ]}
        />
      </Card>
    </Screen>
  );
}
