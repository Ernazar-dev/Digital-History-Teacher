import { BulbOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/common/PageHeader';

/** Metodika bo'limi — mazmuni keyinroq aniqlanadi (o'qitish metodlari va ularni qo'llash) */
export default function MethodologyPage() {
  return (
    <>
      <PageHeader
        title="Metodika"
        description="Tarix darslarida raqamli manbalar bilan ishlash metodlari va ularni qo‘llash bo‘yicha tavsiyalar."
      />
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl text-primary">
          <BulbOutlined />
        </span>
        <h2 className="font-serif-title m-0 text-2xl font-semibold">Bo‘lim tayyorlanmoqda</h2>
        <p className="m-0 max-w-md text-muted">Bu yerda o‘qitish metodlari, ularni darsda qo‘llash bosqichlari va namunalar joylashadi. Tez orada qo‘shiladi.</p>
      </div>
    </>
  );
}
