import { QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import uzUZ from 'antd/locale/uz_UZ';
import dayjs from 'dayjs';
import 'dayjs/locale/uz-latn';
import { RouterProvider } from 'react-router-dom';
import { antTheme } from './app/theme';
import { queryClient } from './lib/queryClient';
import { router } from './routes/router';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

dayjs.locale('uz-latn');

export const App = () => (
  <ErrorBoundary>
    <ConfigProvider theme={antTheme} locale={uzUZ}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  </ErrorBoundary>
);
