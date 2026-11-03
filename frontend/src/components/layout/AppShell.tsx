import { LoginPromptModal } from '@/components/feedback/LoginPrompt';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { AppLayout } from './AppLayout';
import { StudentLayout } from './StudentLayout';

/**
 * O'qituvchi/administrator — sidebarli boshqaruv paneli; talaba va mehmon — yuqori navbarli platforma.
 * Xodim ochiq saytga o'tgan bo'lsa («Saytni ko'rish» rejimi), platforma ham talaba ko'rinishida ochiladi.
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
