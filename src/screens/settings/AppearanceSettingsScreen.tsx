import { Card, SectionLabel, Segmented } from '../../components/ui';
import { Screen } from '../../components/Screen';
import { useLanguage } from '../../state/LanguageContext';
import { useTheme, type ThemePreference } from '../../state/ThemeContext';

export function AppearanceSettingsScreen({ onBack }: { onBack: () => void }) {
  const { preference, setPreference } = useTheme();
  const { t } = useLanguage();

  return (
    <Screen title={t('settings.appearanceSection')} onBack={onBack}>
      <Card>
        <SectionLabel>{t('settings.appearanceSection')}</SectionLabel>
        <Segmented<ThemePreference>
          value={preference}
          onChange={setPreference}
          options={[
            { value: 'light', label: t('settings.themeLight') },
            { value: 'dark', label: t('settings.themeDark') },
            { value: 'system', label: t('settings.themeSystem') },
          ]}
        />
      </Card>
    </Screen>
  );
}
