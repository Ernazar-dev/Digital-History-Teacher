import { App } from 'antd';
import { AuthRequiredError, errorMessage } from '@/lib/http';

/** Mutatsiyalar uchun yagona muvaffaqiyat/xato xabarlari */
export const useNotify = () => {
  const { message, notification } = App.useApp();
  return {
    success: (text: string) => message.success(text),
    error: (err: unknown, title = 'Amal bajarilmadi') => {
      // Mehmon uchun "Kirish" oynasi allaqachon ochilgan — qo'shimcha xato ko'rsatilmaydi
      if (err instanceof AuthRequiredError) return;
      notification.error({ message: title, description: errorMessage(err), placement: 'topRight' });
    },
    info: (text: string) => message.info(text),
  };
};
