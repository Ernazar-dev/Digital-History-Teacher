import timing from './timing.json';
import { SCRIPT } from './script';
import { FPS, TRANSITION } from './theme';

export interface ResolvedLine {
  text: string;
  file: string;
  /** Sahna ichida boshlanish kadri */
  start: number;
  frames: number;
}

export interface ResolvedScene {
  id: string;
  frames: number;
  lines: ResolvedLine[];
  image: string;
  credit: string;
}

/** Fon rasmlar — frontend/public/covers dan; mualliflar backend/prisma/seed-data/lectures.ts dagi coverCredit */
const IMAGES: Record<string, { image: string; credit: string }> = {
  title: { image: 'images/amir-temur-davlati.jpg', credit: 'Go‘ri Amir maqbarasi, Samarqand. Foto: Bgag, CC0' },
  rise: { image: 'images/temuriylar-davri.jpg', credit: 'Ulug‘bek madrasasi, Samarqand. Foto: Bgag, CC0' },
  campaigns: { image: 'images/buyuk-ipak-yoli.jpg', credit: 'Katalon atlasi, 1375. Abraham Cresques, jamoat mulki' },
  tactics: {
    image: 'images/etnogenez-va-etnik-tarix.jpg',
    credit: 'Afrosiyob devoriy suratlari («Elchilar zali») nusxasi. Foto: Nassima Chahboun, CC BY-SA 4.0',
  },
  ankara: { image: 'images/amir-temur-davlati.jpg', credit: 'Go‘ri Amir maqbarasi, Samarqand. Foto: Bgag, CC0' },
  government: { image: 'images/temuriylar-davri.jpg', credit: 'Ulug‘bek madrasasi, Samarqand. Foto: Bgag, CC0' },
  army: {
    image: 'images/etnogenez-va-etnik-tarix.jpg',
    credit: 'Afrosiyob devoriy suratlari («Elchilar zali») nusxasi. Foto: Nassima Chahboun, CC BY-SA 4.0',
  },
  sources: { image: 'images/buyuk-ipak-yoli.jpg', credit: 'Katalon atlasi, 1375. Abraham Cresques, jamoat mulki' },
  finale: { image: 'images/amir-temur-davlati.jpg', credit: 'Go‘ri Amir maqbarasi, Samarqand. Foto: Bgag, CC0' },
  legacy: { image: 'images/temuriylar-davri.jpg', credit: 'Ulug‘bek madrasasi, Samarqand. Foto: Bgag, CC0' },
  outro: { image: 'images/amir-temur-davlati.jpg', credit: 'Go‘ri Amir maqbarasi, Samarqand. Foto: Bgag, CC0' },
};

const LEAD = Math.round(0.7 * FPS); // sahna boshida ovozdan oldingi pauza
const GAP = Math.round(0.45 * FPS); // qatorlar orasidagi pauza
const TAIL = Math.round(1.3 * FPS); // sahna oxiridagi pauza

const table = timing as Record<string, { file: string; seconds: number }[]>;

export const SCENES: ResolvedScene[] = SCRIPT.map((s) => {
  let cursor = LEAD;
  const lines = s.lines.map((text, i) => {
    const { file, seconds } = table[s.id][i];
    const frames = Math.ceil(seconds * FPS);
    const line = { text, file, start: cursor, frames };
    cursor += frames + GAP;
    return line;
  });
  return { id: s.id, frames: cursor - GAP + TAIL, lines, ...IMAGES[s.id] };
});

/** Umumiy davomiylik: sahnalar yig'indisi minus o'tishlarning kesishuvi */
export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0) - (SCENES.length - 1) * TRANSITION;
