import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { MyProgress } from '@/features/progress/pages/ProgressPage';
import { dashboardService } from '@/services/dashboard.service';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { GuestHome } from '../components/GuestHome';
import { StudentDashboardView } from '../components/StudentDashboardView';
import { TeacherDashboardView } from '../components/TeacherDashboardView';

const greetingKey = () => {
  const h = new Date().getHours();
  return h < 5 ? 'dashboard.night' : h < 12 ? 'dashboard.morning' : h < 18 ? 'dashboard.day' : 'dashboard.evening';
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get, enabled: Boolean(user) });

  if (!user) return <GuestHome />;

  const overview = (
    <QueryState query={q}>
      {(d) =>
        d.role === 'STUDENT' ? <StudentDashboardView d={d} /> : d.role === 'TEACHER' ? <TeacherDashboardView d={d} /> : <AdminDashboardView d={d} />
      }
    </QueryState>
  );

  return (
    <>
      <header className="mb-6">
        <div className="text-sm text-muted first-letter:uppercase">{dayjs().format(t('dashboard.dateFormat'))}</div>
        <h1 className="font-serif-title m-0 mt-1 text-3xl font-bold md:text-4xl">
          {t(greetingKey())}, {user.fullName.split(' ')[0]}
        </h1>
        <p className="mb-0 mt-2 text-muted">{t('dashboard.subtitle')}</p>
      </header>
      {user.role === 'STUDENT' ? (
        // Talaba kabineti: umumiy ko'rinish va «Mening o'quv yo'lim» bitta joyda (navbarda alohida band yo'q)
        <Tabs
          activeKey={params.get('tab') === 'yol' ? 'yol' : 'umumiy'}
          onChange={(k) => setParams(k === 'yol' ? { tab: 'yol' } : {}, { replace: true })}
          items={[
            { key: 'umumiy', label: t('dashboard.tabOverview'), children: overview },
            { key: 'yol', label: t('dashboard.tabPath'), children: <MyProgress /> },
          ]}
        />
      ) : (
        overview
      )}
    </>
  );
}
