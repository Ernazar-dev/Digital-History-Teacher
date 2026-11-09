// Kitob videosining har bir diktor qatori uchun Edge TTS (uz-UZ-SardorNeural) bilan mp3 yaratadi va
// src/books/<slug>.timing.json ni yozadi. Ishlatish: node scripts/gen-audio.mjs <slug>   (internet kerak)
import { mkdirSync, writeFileSync } from 'node:fs';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { load } from './book-loader.mjs';
import { toSegments } from './speech.mjs';

const slug = process.argv[2];
const book = await load(slug);

const VOICES = { uz: 'uz-UZ-SardorNeural', en: 'en-US-GuyNeural' }; // sayt nomi inglizcha o'qiladi
const BYTES_PER_SEC = 6000; // 48 kbit/s CBR mono => 6000 bayt/s
const dir = `public/audio/${slug}`;
mkdirSync(dir, { recursive: true });

let tts = new MsEdgeTTS();
let currentVoice = '';
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('vaqt tugadi')), ms))]);
const speakSetup = async (lang) => {
  if (currentVoice !== VOICES[lang]) {
    await tts.setMetadata(VOICES[lang], OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    currentVoice = VOICES[lang];
  }
};
const speak = async (text, lang) => {
  await speakSetup(lang);
  let buf = Buffer.alloc(0);
  for (let attempt = 0; attempt < 4 && buf.length < 1000; attempt++) {
    try {
      const { audioStream } = tts.toStream(text, { rate: lang === 'en' ? '-8%' : '-3%' });
      const chunks = [];
      await withTimeout((async () => { for await (const c of audioStream) chunks.push(c); })(), 45000);
      buf = Buffer.concat(chunks);
    } catch (e) {
      // Ulanish qotib qolsa — yangi ulanish ochiladi va qayta uriniladi
      console.log('  qayta urinish:', e.message);
      tts = new MsEdgeTTS();
      currentVoice = '';
      await speakSetup(lang);
    }
  }
  return buf;
};

const timing = {};
for (const scene of book.scenes) {
  timing[scene.id] = [];
  for (let i = 0; i < scene.lines.length; i++) {
    // Tipografik tutuq belgilari TTS'da o'/g' harflarini buzadi — oddiy apostrofga almashtiramiz
    // Raqamlar so'zga aylanadi, sayt nomi inglizcha ovozda alohida bo'lak bo'lib o'qiladi (bir xil mp3 formatda — qo'shib yuboriladi)
    const pieces = [];
    for (const seg of toSegments(scene.lines[i])) {
      const text = seg.text.replace(/[‘’ʻʼ]/g, "'").replace(/[«»]/g, '"');
      pieces.push(await speak(text, seg.lang));
    }
    const buf = Buffer.concat(pieces);
    const file = `${scene.id}-${i}.mp3`;
    writeFileSync(`${dir}/${file}`, buf);
    const seconds = Math.round((buf.length / BYTES_PER_SEC) * 100) / 100;
    timing[scene.id].push({ file, seconds });
    console.log(file, seconds.toFixed(1) + 's');
  }
}
writeFileSync(`src/books/${slug}.timing.json`, JSON.stringify(timing, null, 2));
const total = Object.values(timing).flat().reduce((s, x) => s + x.seconds, 0);
console.log(`timing.json yozildi. Sof ovoz: ${Math.floor(total / 60)} daq ${Math.round(total % 60)} s`);
