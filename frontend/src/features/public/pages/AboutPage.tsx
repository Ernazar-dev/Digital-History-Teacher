import { Card, Timeline } from 'antd';
import { PageHeader } from '@/components/common/PageHeader';
import { usePlatform } from '@/hooks/usePlatform';
import { MODULES } from '../content';

export default function AboutPage() {
  const { name, fullName } = usePlatform();
  return (
    <div className="space-y-8">
      <PageHeader title="Platforma haqida" description={fullName || name} />
      <Card title="Maqsad">
        <p className="prose-text m-0">
          Pedagogika oliy ta’lim muassasalari talabalarining raqamli tarixiy manbalarni izlash, saralash, tanqidiy tahlil qilish va ulardan samarali
          foydalanib, zamonaviy tarix darslarini loyihalash kompetensiyasini takomillashtirish. Platforma faqat ma’lumot beruvchi vosita emas — talabaning
          kasbiy-metodik mahoratini shakllantiruvchi ta’lim muhiti.
        </p>
      </Card>
      <Card title="Modullar">
        <Timeline items={MODULES.map((m) => ({ children: <><b>{m.title}.</b> {m.text}</> }))} />
      </Card>
    </div>
  );
}
