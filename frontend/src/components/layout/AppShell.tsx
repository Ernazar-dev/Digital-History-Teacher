import { LoginPromptModal } from '@/components/feedback/LoginPrompt';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { AppLayout } from './AppLayout';
import { StudentLayout } from './StudentLayout';

/**
 * Öqituvçi/administrator — sidebarli boşqaruv paneli; talaba va mehmon — yuqori navbarli platforma.
 * Xodim oçiq saytga ötgan bölsa («Saytni köriş» rejimi), platforma ham talaba körinişida oçiladi.
 */
export const AppShell = () => {
  const user = useAuthStore((s) => s.user);
  const siteView = useSiteViewStore((s) => s.siteView);
  const staff = (user?.role === 'ADMIN' || user?.role === 'TEACHER') && !siteView;
  return (
    <>
      {staff ? <AppLayout /> : <StudentLayout />}
      <LoginPromptModal />
    </>
  );
};
