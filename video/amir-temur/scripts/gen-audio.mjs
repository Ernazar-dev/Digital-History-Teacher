// Har bir ssenariy qatori uchun Edge TTS (uz-UZ-SardorNeural) bilan mp3 yaratadi va src/timing.json yozadi.
// Ishlatish: node scripts/gen-audio.mjs   (internet kerak)
import { mkdirSync, writeFileSync } from 'node:fs';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { SCRIPT } from '../src/script.ts';

const ONES = ['', 'birinchi', 'ikkinchi', 'uchinchi', 'to‘rtinchi', 'beshinchi', 'oltinchi', 'yettinchi', 'sakkizinchi', 'to‘qqizinchi'];
const ROMAN = /\b(X{0,3}(?:IX|IV|V?I{0,3}))\b/g;
const ROMAN_VALUE = { I: 1, V: 5, X: 10 };
const romanValue = (s) =>
  [...s].reduce((sum, ch, i) => (ROMAN_VALUE[ch] < (ROMAN_VALUE[s[i + 1]] ?? 0) ? sum - ROMAN_VALUE[ch] : sum + ROMAN_VALUE[ch]), 0);
const ordinal = (n) => (n < 10 ? ONES[n] : n === 10 ? 'o‘ninchi' : n < 20 ? `o‘n ${ONES[n - 10]}` : String(n));
/** Diktor uchun matn: rim raqamlari (XIV) so'zga aylanadi — aks holda TTS ularni harf-harf o'qiydi */
const toSpeech = (text) => text.replace(ROMAN, (m) => (m ? ordinal(romanValue(m)) : m));

const VOICE = 'uz-UZ-SardorNeural';
const BYTES_PER_SEC = 6000; // 48 kbit/s CBR mono => 6000 bayt/s
mkdirSync('public/audio', { recursive: true });

const tts = new MsEdgeTTS();
await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

const timing = {};
for (const scene of SCRIPT) {
  timing[scene.id] = [];
  for (let i = 0; i < scene.lines.length; i++) {
    // Tipografik tutuq belgilari TTS'da o'/g' harflarini buzadi — oddiy apostrofga almashtiramiz
    const text = toSpeech(scene.lines[i]).replace(/[‘’ʻʼ]/g, "'").replace(/[«»]/g, '"');
    const { audioStream } = tts.toStream(text, { rate: '-3%' });
    const chunks = [];
    for await (const c of audioStream) chunks.push(c);
    const buf = Buffer.concat(chunks);
    const file = `${scene.id}-${i}.mp3`;
    writeFileSync(`public/audio/${file}`, buf);
    const seconds = buf.length / BYTES_PER_SEC;
    timing[scene.id].push({ file, seconds: Math.round(seconds * 100) / 100 });
    console.log(file, seconds.toFixed(1) + 's');
  }
}
writeFileSync('src/timing.json', JSON.stringify(timing, null, 2));
console.log('timing.json yozildi');
