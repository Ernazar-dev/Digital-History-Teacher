/**
 * Kutubxonalar (docx-preview, pptx-preview) fayldan yasagan HTML ni tozalaydi.
 * Yuklangan hujjat ichiga yashirilgan skript, iframe, `on*` hodisalar va `javascript:` havolalari olib tashlanadi (XSS).
 */
const DANGEROUS = 'script,iframe,frame,object,embed,form,input,button,textarea,select,meta,link,base';
const URL_ATTRS = ['href', 'src', 'xlink:href', 'action', 'formaction', 'poster'];
const SAFE_URL = /^(https?:|blob:|#|data:image\/(png|jpe?g|gif|webp|bmp);)/i;

export const sanitizeDom = (root: HTMLElement) => {
  root.querySelectorAll(DANGEROUS).forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || name === 'srcdoc') el.removeAttribute(attr.name);
      else if (URL_ATTRS.includes(name) && !SAFE_URL.test(attr.value.trim())) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A' && el.hasAttribute('href')) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });
};
