import { FPS, TRANSITION } from './theme';
import type { Book, Scene } from './types';

export interface ResolvedLine {
  text: string;
  file: string;
  /** Sahna ichida boshlanish kadri */
  start: number;
  frames: number;
}

export interface ResolvedScene extends Scene {
  frames: number;
  resolved: ResolvedLine[];
}

export interface ResolvedBook {
  book: Book;
  scenes: ResolvedScene[];
  total: number;
  /** rasm kaliti -> «Rasm: muallif, litsenziya» */
  credits: Record<string, string>;
}

export type TimingTable = Record<string, { file: string; seconds: number }[]>;
export type CreditsTable = Record<string, { license: string; artist: string }>;

const LEAD = Math.round(0.8 * FPS); // sahna boshida ovozdan oldingi pauza (animatsiya kirishi)
const GAP = Math.round(0.5 * FPS); // qatorlar orasidagi pauza
const TAIL = Math.round(1.4 * FPS); // sahna oxiridagi pauza

export const resolveBook = (book: Book, timing: TimingTable, creditsTable: CreditsTable): ResolvedBook => {
  const scenes = book.scenes.map((s) => {
    let cursor = LEAD;
    const resolved = s.lines.map((text, i) => {
      const { file, seconds } = timing[s.id][i];
      const frames = Math.ceil(seconds * FPS);
      const line = { text, file, start: cursor, frames };
      cursor += frames + GAP;
      return line;
    });
    return { ...s, resolved, frames: cursor - GAP + TAIL };
  });
  const credits = Object.fromEntries(
    Object.entries(creditsTable).map(([key, c]) => [key, `Rasm: ${[c.artist, c.license.replace('Public domain', 'jamoat mulki')].filter(Boolean).join(', ')}`]),
  );
  return {
    book,
    scenes,
    credits,
    total: scenes.reduce((sum, s) => sum + s.frames, 0) - (scenes.length - 1) * TRANSITION,
  };
};
