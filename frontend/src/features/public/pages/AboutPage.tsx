import { Card, Timeline } from 'antd';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { usePlatform } from '@/hooks/usePlatform';
import { MODULES } from '../content';

export default function AboutPage() {
  const { t } = useTranslation();
  const { name, fullName } = usePlatform();
  return (
    <div className="space-y-8">
      <PageHeader title={t('nav.about')} description={fullName || name} />
      <Card title={t('about.goalTitle')}>
        <p className="prose-text m-0">{t('about.goalText')}</p>
      </Card>
      <Card title={t('about.modulesTitle')}>
        <Timeline items={MODULES.map((m) => ({ children: <><b>{m.title}.</b> {m.text}</> }))} />
      </Card>
    </div>
  );
}
