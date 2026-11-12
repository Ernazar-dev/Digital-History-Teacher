import { create } from 'zustand';

/**
 * «Saytni köriş» rejimi — öqituvçi/administrator oçiq saytga ötgaç, platformani talaba közi bilan köradi
 * (sidebarli boşqaruv paneli emas, yuqori navbar). Rejim faqat şu tabga tegişli (sessionStorage):
 * boşqaruv panelidagi asl tab özgarmaydi. Panelga qaytiş — profil menyusidagi «Boşqaruv paneli» orqali.
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
    /* saqlaş bloklangan — rejim faqat xotirada */
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
