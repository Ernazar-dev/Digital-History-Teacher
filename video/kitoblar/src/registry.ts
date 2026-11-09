import { AVESTO } from './books/avesto';
import avestoCredits from './books/avesto.credits.json';
import avestoTiming from './books/avesto.timing.json';
import { BOBURNOMA } from './books/boburnoma';
import boburnomaCredits from './books/boburnoma.credits.json';
import boburnomaTiming from './books/boburnoma.timing.json';
import { BUXORO_TARIXI } from './books/buxoro-tarixi';
import buxoroCredits from './books/buxoro-tarixi.credits.json';
import buxoroTiming from './books/buxoro-tarixi.timing.json';
import { SHAJARAI_TURK } from './books/shajarai-turk';
import shajaraiCredits from './books/shajarai-turk.credits.json';
import shajaraiTiming from './books/shajarai-turk.timing.json';
import { ZAFARNOMA } from './books/zafarnoma';
import zafarnomaCredits from './books/zafarnoma.credits.json';
import zafarnomaTiming from './books/zafarnoma.timing.json';
import { resolveBook, type CreditsTable, type TimingTable } from './timing';

/** Tayyor kitob videolari (ssenariy + diktor vaqtlari + rasm mualliflari). Yangi kitob shu yerga qo'shiladi. */
export const RESOLVED = [
  resolveBook(AVESTO, avestoTiming as TimingTable, avestoCredits as CreditsTable),
  resolveBook(BUXORO_TARIXI, buxoroTiming as TimingTable, buxoroCredits as CreditsTable),
  resolveBook(ZAFARNOMA, zafarnomaTiming as TimingTable, zafarnomaCredits as CreditsTable),
  resolveBook(BOBURNOMA, boburnomaTiming as TimingTable, boburnomaCredits as CreditsTable),
  resolveBook(SHAJARAI_TURK, shajaraiTiming as TimingTable, shajaraiCredits as CreditsTable),
];
