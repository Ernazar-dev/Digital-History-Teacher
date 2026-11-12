import { useLocation } from 'react-router-dom';

/** Oçiq katalog (/catalog) yoki kabinet (/app) içida ekanligiga qarab havolalarni moslaydi */
export const useAreaPath = () => {
  const { pathname } = useLocation();
  const inApp = pathname.startsWith('/app');
  return {
    inApp,
    sources: inApp ? '/app/sources' : '/catalog/sources',
    museum: inApp ? '/app/museum' : '/catalog/museum',
  };
};
