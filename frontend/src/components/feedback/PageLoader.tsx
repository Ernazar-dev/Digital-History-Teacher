/** Yuklanish holati: markazda 4 nuqtali aylanuvchi spinner + "Yuklanmoqda..." yozuvi */
export const PageLoader = () => (
  <div className="page-fallback" role="status" aria-label="Yuklanmoqda">
    <div className="flex flex-col items-center gap-3 text-primary">
      <span className="dot-spin" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="text-sm">Yuklanmoqda...</span>
    </div>
  </div>
);
