import { LoginPromptModal } from '@/components/feedback/LoginPrompt';
import { useAuthStore } from '@/features/auth/auth.store';
import { AppLayout } from './AppLayout';
import { StudentLayout } from './StudentLayout';

/** O'qituvchi/administrator — sidebarli boshqaruv paneli; talaba va mehmon — yuqori navbarli platforma */
export const AppShell = () => {
  const user = useAuthStore((s) => s.user);
  const staff = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  return (
    <>
      {staff ? <AppLayout /> : <StudentLayout />}
      <LoginPromptModal />
    </>
  );
};
