import i18n from '@/i18n';

/** Yuklaniş holati: markazda 4 nuqtali aylanuvçi spinner + "Yuklanmoqda..." yozuvi */
export const PageLoader = () => (
  <div className="page-fallback" role="status" aria-label="Yuklanmoqda">
    <div className="flex flex-col items-center gap-3 text-[#1677ff]">
      <span className="dot-spin" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="text-sm">{i18n.t('common.loading')}</span>
    </div>
  </div>
);
