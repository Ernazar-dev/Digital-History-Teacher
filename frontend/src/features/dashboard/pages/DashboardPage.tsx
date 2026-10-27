import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'antd';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { MyProgress } from '@/features/progress/pages/ProgressPage';
import { dashboardService } from '@/services/dashboard.service';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { GuestHome } from '../components/GuestHome';
import { StudentDashboardView } from '../components/StudentDashboardView';
import { TeacherDashboardView } from '../components/TeacherDashboardView';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Xayrli tun' : h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech';
};

export default function DashboardPage() {
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
        <div className="text-sm text-muted first-letter:uppercase">{dayjs().format('dddd, D-MMMM')}</div>
        <h1 className="font-serif-title m-0 mt-1 text-3xl font-bold md:text-4xl">
          {greeting()}, {user.fullName.split(' ')[0]}
        </h1>
        <p className="mb-0 mt-2 text-muted">Bugungi metodik faoliyatingiz va asosiy ko‘rsatkichlar.</p>
      </header>
      {user.role === 'STUDENT' ? (
        // Talaba kabineti: umumiy ko'rinish va «Mening o'quv yo'lim» bitta joyda (navbarda alohida band yo'q)
        <Tabs
          activeKey={params.get('tab') === 'yol' ? 'yol' : 'umumiy'}
          onChange={(k) => setParams(k === 'yol' ? { tab: 'yol' } : {}, { replace: true })}
          items={[
            { key: 'umumiy', label: 'Umumiy', children: overview },
            { key: 'yol', label: 'Mening o‘quv yo‘lim', children: <MyProgress /> },
          ]}
        />
      ) : (
        overview
      )}
    </>
  );
}
