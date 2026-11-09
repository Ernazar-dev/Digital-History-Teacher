import type { Book } from '../types';
import { AVESTO } from './avesto.ts';
import { BOBURNOMA } from './boburnoma.ts';
import { BUXORO_TARIXI } from './buxoro-tarixi.ts';
import { SHAJARAI_TURK } from './shajarai-turk.ts';
import { ZAFARNOMA } from './zafarnoma.ts';

/** Tayyor kitob videolari. Yangi kitob: src/books/<slug>.ts, <slug>.timing.json, <slug>.credits.json, public/images/<slug>/ */
export const BOOKS: Book[] = [AVESTO, BUXORO_TARIXI, ZAFARNOMA, BOBURNOMA, SHAJARAI_TURK];
