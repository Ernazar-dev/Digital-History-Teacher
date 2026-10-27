import { useLocation } from 'react-router-dom';

/** Ochiq katalog (/catalog) yoki kabinet (/app) ichida ekanligiga qarab havolalarni moslaydi */
export const useAreaPath = () => {
  const { pathname } = useLocation();
  const inApp = pathname.startsWith('/app');
  return {
    inApp,
    sources: inApp ? '/app/sources' : '/catalog/sources',
    museum: inApp ? '/app/museum' : '/catalog/museum',
  };
};
