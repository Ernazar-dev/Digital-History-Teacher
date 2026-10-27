import { Alert, Card, Table, Timeline } from 'antd';
import { PageHeader } from '@/components/common/PageHeader';
import { usePlatform } from '@/hooks/usePlatform';
import { COMPONENTS_INFO, MODULES } from '../content';

export default function AboutPage() {
  const { name, fullName } = usePlatform();
  return (
    <div className="space-y-8">
      <PageHeader title="Platforma haqida" description={fullName || name} />
      <Card title="Maqsad">
        <p className="prose-text m-0">
          Pedagogika oliy ta’lim muassasalari talabalarining raqamli tarixiy manbalarni izlash, saralash, tanqidiy tahlil qilish va ulardan samarali
          foydalanib, zamonaviy tarix darslarini loyihalash kompetensiyasini rivojlantirish. Platforma faqat ma’lumot beruvchi vosita emas — talabaning
          kasbiy-metodik mahoratini shakllantiruvchi ta’lim muhiti.
        </p>
      </Card>
      <Card title="Modullar">
        <Timeline items={MODULES.map((m) => ({ children: <><b>{m.title}.</b> {m.text}</> }))} />
      </Card>
      <Card title="Metodik kompetensiya komponentlari (ishchi model)">
        <Table
          rowKey="name"
          pagination={false}
          dataSource={COMPONENTS_INFO}
          scroll={{ x: 600 }}
          columns={[
            { title: 'Komponent', dataIndex: 'name', width: 200 },
            { title: 'Baholanadigan ko‘nikmalar', dataIndex: 'skills' },
            { title: 'Baholash usuli', dataIndex: 'methods', width: 260 },
          ]}
        />
        <Alert
          className="mt-4"
          type="info"
          showIcon
          message="Muhim izoh"
          description="Komponentlar, daraja chegaralari va vaznlar tadqiqot uchun taklif etilgan dastlabki ishchi model bo‘lib, nazariy tahlil, ekspertlar fikri va dastlabki diagnostika natijalari asosida takomillashtiriladi. Platformadagi avtomatik hisob-kitoblar eksperiment samaradorligining isboti emas — ular ma’lumot yig‘ish va tahlil qilishga yordam beradi."
        />
      </Card>
      <Card title="Pedagogik eksperimentni qo‘llab-quvvatlash">
        <Timeline
          items={[
            { children: <><b>Aniqlovchi bosqich</b> — boshlang‘ich diagnostika: test, so‘rovnoma, refleksiv savollar.</> },
            { children: <><b>Shakllantiruvchi bosqich</b> — tajriba guruhi platforma va unga asoslangan metodika orqali ishlaydi.</> },
            { children: <><b>Nazorat bosqichi</b> — har ikki guruhda bir xil mezonlar asosida yakuniy diagnostika.</> },
          ]}
        />
      </Card>
    </div>
  );
}
