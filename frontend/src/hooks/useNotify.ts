import { App } from 'antd';
import i18n from '@/i18n';
import { AuthRequiredError, errorMessage } from '@/lib/http';

/** Mutatsiyalar uçun yagona muvaffaqiyat/xato xabarlari */
export const useNotify = () => {
  const { message, notification } = App.useApp();
  return {
    success: (text: string) => message.success(text),
    error: (err: unknown, title = i18n.t('errors.actionFailed')) => {
      // Mehmon uçun "Kiriş" oynasi allaqaçon oçilgan — qöşimça xato körsatilmaydi
      if (err instanceof AuthRequiredError) return;
      notification.error({ message: title, description: errorMessage(err), placement: 'topRight' });
    },
    info: (text: string) => message.info(text),
  };
};
