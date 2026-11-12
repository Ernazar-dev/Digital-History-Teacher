import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import ruRU from 'antd/locale/ru_RU';
import uzUZ from 'antd/locale/uz_UZ';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/uz-latn';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { antTheme } from './app/theme';
import { queryClient } from './lib/queryClient';
import { router } from './routes/router';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { currentLang, type Lang } from './i18n';

const ANT_LOCALE = { uz: uzUZ, ru: ruRU, en: enUS } as const;
const DAYJS_LOCALE: Record<Lang, string> = { uz: 'uz-latn', ru: 'ru', en: 'en' };

dayjs.locale(DAYJS_LOCALE[currentLang()]);

export const App = () => {
  // Til almaşganda komponentlar qayta çiziladi
  useTranslation();
  const lang = currentLang();

  useEffect(() => {
    dayjs.locale(DAYJS_LOCALE[lang]);
    // Server kontenti tilga boğliq (X-Lang) — faol sörovlar yangi tilda qayta yuklanadi
    void queryClient.invalidateQueries();
  }, [lang]);

  return (
    <ErrorBoundary>
      <ConfigProvider theme={antTheme} locale={ANT_LOCALE[lang]}>
        <AntApp>
          <QueryClientProvider client={queryClient}>
            {/* key={lang}: i18n.t() işlatadigan komponentlar (breadcrumb, sarlavhalar) til almaşganda qayta çiziladi — qölda yangilaş şart emas */}
            <RouterProvider key={lang} router={router} future={{ v7_startTransition: true }} />
          </QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};
