export type SceneKind = 'title' | 'story' | 'journey' | 'quote' | 'outro';

export interface RoutePoint {
  name: string;
  lat: number;
  lon: number;
  /** Xaritada shu shahar paydo bo'ladigan diktor qatori (0 dan) */
  line: number;
  /** Shahar tagidagi sana yozuvi */
  note?: string;
}

export interface Scene {
  id: string;
  kind: SceneKind;
  /** Chap tepadagi kichik oltin yozuv */
  kicker?: string;
  heading?: string;
  /** Diktor matni — har bir qator alohida ovozlanadi va subtitr bo'ladi */
  lines: string[];
  /** Har bir qator uchun katta «muhr» (yil yoki raqam); null — ko'rsatilmaydi */
  stamps?: (string | null)[];
  /** Qatorlar ketidan birin-ketin chiqadigan kalit so'zlar */
  chips?: string[];
  /** Book.images kalitlari — sahna davomida almashib turadi */
  images: string[];
  quote?: { text: string; by: string };
  route?: RoutePoint[];
}

export interface Book {
  slug: string;
  compId: string;
  title: string;
  author: string;
  years: string;
  /** kalit -> public/images/<slug>/<kalit>.jpg */
  images: string[];
  /** Juda keng (panorama) rasmlar kalitlari — kartada butunligicha emas, chetlari qirqilib, yon tomonga siljib ko'rsatiladi */
  wide?: string[];
  scenes: Scene[];
}
