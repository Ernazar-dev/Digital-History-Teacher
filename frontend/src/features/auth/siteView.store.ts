import { create } from 'zustand';

/**
 * «Saytni ko'rish» rejimi — o'qituvchi/administrator ochiq saytga o'tgach, platformani talaba ko'zi bilan ko'radi
 * (sidebarli boshqaruv paneli emas, yuqori navbar). Rejim faqat shu tabga tegishli (sessionStorage):
 * boshqaruv panelidagi asl tab o'zgarmaydi. Panelga qaytish — profil menyusidagi «Boshqaruv paneli» orqali.
 */
const KEY = 'dht_site_view';

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

const write = (on: boolean) => {
  try {
    if (on) sessionStorage.setItem(KEY, '1');
    else sessionStorage.removeItem(KEY);
  } catch {
    /* saqlash bloklangan — rejim faqat xotirada */
  }
};

interface SiteViewState {
  siteView: boolean;
  setSiteView: (on: boolean) => void;
}

export const useSiteViewStore = create<SiteViewState>((set) => ({
  siteView: read(),
  setSiteView: (on) => {
    write(on);
    set({ siteView: on });
  },
}));
