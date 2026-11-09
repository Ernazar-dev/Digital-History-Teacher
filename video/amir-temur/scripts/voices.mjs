import { MsEdgeTTS } from 'msedge-tts';
const tts = new MsEdgeTTS();
const v = (await tts.getVoices()).filter((x) => x.Locale.startsWith('uz'));
console.log(v.map((x) => `${x.ShortName} ${x.Gender}`));
