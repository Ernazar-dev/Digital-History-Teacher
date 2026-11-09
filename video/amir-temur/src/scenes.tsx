import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Backdrop, Captions, Heading, Narration, useReveal } from './common';
import type { ResolvedScene } from './timing';
import { C, serif } from './theme';

interface SceneProps {
  scene: ResolvedScene;
}

/** Sahna qobig'i: fon + ovoz + subtitr */
const Shell: React.FC<{ scene: ResolvedScene; light?: boolean; flip?: boolean; children: React.ReactNode }> = ({
  scene,
  light,
  flip,
  children,
}) => (
  <Backdrop scene={scene} light={light} flip={flip}>
    {children}
    <Narration scene={scene} />
    <Captions scene={scene} />
  </Backdrop>
);

const Pad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: 160, right: 160, top: 110, bottom: 210 }}>{children}</div>
);

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: C.gold, fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', marginBottom: 18 }}>
    {children}
  </div>
);

/** 1. Sarlavha */
export const TitleScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [20, 60], [0, 520], { extrapolateRight: 'clamp' });
  return (
    <Shell scene={scene} light>
      <div style={{ position: 'absolute', left: 160, top: 250 }}>
        <div style={useReveal(0)}>
          <Eyebrow>Ma’ruza · O‘zbekiston tarixi</Eyebrow>
        </div>
        <div style={useReveal(8)}>
          <Heading size={150}>Amir Temur</Heading>
          <Heading size={150}>davlati</Heading>
        </div>
        <div style={{ height: 6, width: line, background: C.gold, margin: '36px 0' }} />
        <div style={{ ...useReveal(40), fontFamily: serif, fontSize: 64, color: C.gold }}>1370 – 1405</div>
      </div>
    </Shell>
  );
};

const spaced = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** 0 dan `to` gacha sanab chiqadi, `at` kadrdan boshlab */
const useCount = (at: number, to: number, dur = 45) => {
  const frame = useCurrentFrame();
  return Math.round(interpolate(frame, [at, at + dur], [0, to], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }));
};

const Stat: React.FC<{
  at: number;
  to: number;
  label: string;
  sub?: string;
  format?: boolean;
  count?: boolean;
  suffix?: string;
  width?: number;
  size?: number;
}> = ({
  at,
  to,
  label,
  sub,
  format,
  count = true,
  suffix = '',
  width = 480,
  size = 190,
}) => {
  const counted = useCount(at, to);
  const n = count ? counted : to;
  return (
    <div style={{ ...useReveal(at), width, textAlign: 'center' }}>
      <div style={{ fontFamily: serif, fontWeight: 900, fontSize: size, color: C.gold, lineHeight: 1, whiteSpace: 'nowrap', textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
        {format ? spaced(n) : n}
        {suffix}
      </div>
      <div style={{ fontSize: 36, color: C.cream, marginTop: 14 }}>{label}</div>
      {sub && <div style={{ fontSize: 26, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  );
};

const Quote: React.FC<{ at: number; children: React.ReactNode; by?: string; accent?: string; width?: number; size?: number }> = ({
  at,
  children,
  by,
  accent = C.gold,
  width = 760,
  size = 50,
}) => (
  <div
    style={{
      ...useReveal(at),
      width,
      padding: '40px 46px',
      borderRadius: 24,
      background: 'rgba(10,26,47,0.8)',
      borderLeft: `8px solid ${accent}`,
    }}
  >
    <div style={{ fontFamily: serif, fontSize: size, fontWeight: 700, lineHeight: 1.25 }}>{children}</div>
    {by && <div style={{ color: accent, fontSize: 30, marginTop: 22 }}>{by}</div>}
  </div>
);

/** 2. Hokimiyatga yo'l: to'rt bosqich (diktor tartibida) */
export const RiseScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const L = (i: number) => scene.lines[i].start;
  const steps = [
    { year: '1336', title: 'Tug‘ilishi', text: 'Kesh, Xo‘ja Ilg‘or qishlog‘i. Chig‘atoy ulusi parokanda edi' },
    { year: '1362', title: 'Seyiston', text: 'Jangda jarohat: umrbod oqsoqlanib qoldi' },
    { year: '1365', title: 'Loy jangi', text: 'Yomg‘ir tufayli chekinishga to‘g‘ri keldi' },
    { year: '1370', title: 'Qurultoy', text: 'Movarounnahr amiri. Poytaxt — Samarqand' },
  ];
  const progress = interpolate(frame, [L(0), L(1), L(2), L(3)], [0, 33, 66, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <Shell scene={scene}>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Hokimiyatga yo‘l</Eyebrow>
          <Heading>Parokandalikdan markazlashuvgacha</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, height: 6, background: 'rgba(255,255,255,0.15)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold }} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', justifyContent: 'space-between' }}>
          {steps.map((s, i) => (
            <div key={s.year} style={{ ...useReveal(L(i)), width: 360 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: C.gold, marginBottom: 28 }} />
              <div style={{ fontFamily: serif, fontSize: 64, fontWeight: 900, color: C.gold }}>{s.year}</div>
              <div style={{ fontSize: 40, fontWeight: 600, margin: '6px 0' }}>{s.title}</div>
              <div style={{ fontSize: 28, color: C.muted, lineHeight: 1.35 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </Pad>
    </Shell>
  );
};

/** 3. Yurishlar: 5 ta karta, har biri o'z qatori bilan paydo bo'ladi */
export const CampaignsScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const cards = [
    { year: '1388', title: 'Xorazm', text: 'Urganch egallandi, So‘fiylar sulolasi tugatildi' },
    { year: '1391', title: 'Qunduzcha', text: 'To‘xtamishxon qo‘shini tor-mor etildi' },
    { year: '1395', title: 'Terek', text: 'Oltin O‘rda poytaxti Saroy Berka olindi' },
    { year: '1398–99', title: 'Hindiston', text: 'O‘ljalar orasida 120 ta fil bor edi' },
    { year: '1402', title: 'Anqara', text: 'Usmoniylar sultoni Boyazid mag‘lub etildi' },
  ];
  return (
    <Shell scene={scene} flip>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Harbiy yurishlar</Eyebrow>
          <Heading size={72}>Saltanatning barpo etilishi</Heading>
        </div>
        <div style={{ position: 'absolute', top: 190, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {cards.map((c, i) => {
            const start = scene.lines[i].start;
            const end = scene.lines[i].start + scene.lines[i].frames;
            const active = frame >= start && frame < end;
            return (
              <div
                key={c.year}
                style={{
                  ...useReveal(start),
                  padding: '26px 30px',
                  borderRadius: 20,
                  background: active ? 'rgba(217,173,85,0.16)' : 'rgba(10,26,47,0.72)',
                  border: `2px solid ${active ? C.gold : 'rgba(217,173,85,0.3)'}`,
                  minHeight: 250,
                  boxShadow: active ? '0 0 40px rgba(217,173,85,0.25)' : 'none',
                }}
              >
                <div style={{ fontFamily: serif, fontSize: 56, fontWeight: 900, color: C.gold }}>{c.year}</div>
                <div style={{ fontSize: 38, fontWeight: 600, margin: '4px 0 10px' }}>{c.title}</div>
                <div style={{ fontSize: 28, color: C.muted, lineHeight: 1.35 }}>{c.text}</div>
              </div>
            );
          })}
        </div>
      </Pad>
    </Shell>
  );
};

/** 4. Jang san'ati: yetti qo'l va Terek jangi */
export const TacticsScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  return (
    <Shell scene={scene}>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Jang san’ati</Eyebrow>
          <Heading size={72}>Yetti qo‘l — yangi taktika</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 230, width: 880 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n, i) => (
              <div
                key={n}
                style={{
                  ...useReveal(L(0) + i * 14),
                  flex: 1,
                  height: n === 4 ? 210 : 150,
                  borderRadius: 14,
                  background: n === 4 ? C.gold : 'rgba(217,173,85,0.3)',
                  color: n === 4 ? C.bg : C.cream,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                  fontWeight: 600,
                }}
              >
                {n}
                {n === 4 && <div style={{ fontSize: 24 }}>markaz</div>}
              </div>
            ))}
          </div>
          <div
            style={{
              ...useReveal(L(0) + 140),
              marginTop: 14,
              height: 64,
              borderRadius: 14,
              border: `2px dashed ${C.teal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: C.teal,
            }}
          >
            zaxira bo‘linma
          </div>
        </div>
        <div style={{ position: 'absolute', right: 0, top: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>
          <Stat at={L(1)} to={400000} format label="jangchi" sub="Terek jangi, 1395-yil" width={620} size={130} />
          <div
            style={{
              ...useReveal(L(1) + 150),
              padding: '16px 32px',
              borderRadius: 40,
              border: `2px solid ${C.teal}`,
              background: 'rgba(10,26,47,0.8)',
              fontSize: 30,
            }}
          >
            Taslim bo‘lgan shaharlarga ziyon yetkazilmagan
          </div>
        </div>
      </Pad>
    </Shell>
  );
};

/** 5. Anqara jangi va uning oqibati */
export const AnkaraScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  const steps = [
    { title: 'Anqara, 1402', sub: '20-iyul, Chibukobod tekisligi', at: L(0) },
    { title: 'Boyazid asirda', sub: 'Temur unga yaxshi muomala qildi', at: L(0) + 90 },
  ];
  return (
    <Shell scene={scene} flip>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Anqara jangi</Eyebrow>
          <Heading size={72}>Temur va Boyazid</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 220, width: 780, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {steps.map((s) => (
            <div
              key={s.title}
              style={{
                ...useReveal(s.at),
                padding: '30px 38px',
                borderRadius: 20,
                background: 'rgba(10,26,47,0.8)',
                borderLeft: `8px solid ${C.gold}`,
              }}
            >
              <div style={{ fontFamily: serif, fontSize: 54, fontWeight: 900 }}>{s.title}</div>
              <div style={{ fontSize: 30, color: C.muted, marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', right: 0, top: 200 }}>
          <Stat at={L(1)} to={50} label="yilga kechikdi" sub="turklarning Yevropaga hujumi" width={640} size={260} />
        </div>
      </Pad>
    </Shell>
  );
};

const Box: React.FC<{ delay: number; title: string; sub?: string; accent?: boolean; width?: number }> = ({
  delay,
  title,
  sub,
  accent,
  width = 420,
}) => (
  <div
    style={{
      ...useReveal(delay),
      width,
      padding: '20px 24px',
      borderRadius: 16,
      textAlign: 'center',
      background: accent ? C.gold : 'rgba(10,26,47,0.8)',
      color: accent ? C.bg : C.cream,
      border: accent ? 'none' : '1px solid rgba(217,173,85,0.5)',
    }}
  >
    <div style={{ fontSize: 38, fontWeight: 600 }}>{title}</div>
    {sub && <div style={{ fontSize: 26, opacity: 0.8, marginTop: 4 }}>{sub}</div>}
  </div>
);

/** 6. Davlat boshqaruvi */
export const GovernmentScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  return (
    <Shell scene={scene}>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Davlat boshqaruvi</Eyebrow>
          <Heading size={72}>Dargoh va devon</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 200, width: 840, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <Box delay={L(0)} title="Amir Temur" sub="dargoh boshlig‘i" accent width={400} />
          <div style={{ display: 'flex', gap: 40 }}>
            <Box delay={L(0) + 40} title="Dargoh" sub="eng oliy idora" width={400} />
            <Box delay={L(0) + 70} title="Devon" sub="ijroiya hokimiyat" width={400} />
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            <Box delay={L(0) + 130} title="7 vazir" width={400} />
            <Box delay={L(0) + 160} title="12 toifa" width={400} />
          </div>
        </div>
        <div style={{ position: 'absolute', right: 0, top: 200 }}>
          <Quote at={L(1)} by="— «Temur tuzuklari»" size={42} width={700}>
            «Saltanat ishlarining to‘qqiz ulushi kengash va tadbir, bir ulushi — qilich.»
          </Quote>
        </div>
        <div
          style={{
            ...useReveal(L(2)),
            position: 'absolute',
            right: 0,
            top: 590,
            padding: '16px 34px',
            borderRadius: 40,
            border: `2px solid ${C.teal}`,
            background: 'rgba(10,26,47,0.8)',
            fontSize: 30,
          }}
        >
          Ayblov uchun — 4 guvoh
        </div>
      </Pad>
    </Shell>
  );
};

/** 7. Qo'shin */
export const ArmyScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  const ranks = ['O‘nlik', 'Yuzlik', 'Minglik', 'Tuman'];
  const ladder = [
    { n: '1-jasorat', rank: 'O‘nboshi' },
    { n: '2-jasorat', rank: 'Yuzboshi' },
    { n: '3-jasorat', rank: 'Mingboshi' },
  ];
  return (
    <Shell scene={scene} flip>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Qo‘shin</Eyebrow>
          <Heading size={72}>Martaba — jasorat uchun</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 210, width: 820 }}>
          <div style={{ ...useReveal(L(0)), fontSize: 34, color: C.gold, marginBottom: 20 }}>Qo‘shin tuzilishi</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            {ranks.map((r, i) => (
              <div
                key={r}
                style={{
                  ...useReveal(L(0) + 10 + i * 18),
                  flex: 1,
                  height: 120 + i * 50,
                  borderRadius: 14,
                  background: `rgba(217,173,85,${0.25 + i * 0.2})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 600,
                  color: i > 1 ? C.bg : C.cream,
                }}
              >
                {r}
              </div>
            ))}
          </div>
          <div style={{ ...useReveal(L(0) + 90), fontSize: 30, color: C.cream, marginTop: 22 }}>313 amir qo‘shinga rahbarlik qilgan</div>
        </div>
        <div style={{ position: 'absolute', right: 0, top: 210, width: 700 }}>
          <div style={{ ...useReveal(L(1)), fontSize: 34, color: C.gold, marginBottom: 20 }}>Oddiy askardan mingboshigacha</div>
          {ladder.map((s, i) => (
            <div
              key={s.n}
              style={{
                ...useReveal(L(1) + i * 60),
                display: 'flex',
                justifyContent: 'space-between',
                padding: '22px 32px',
                marginBottom: 16,
                borderRadius: 16,
                background: 'rgba(10,26,47,0.8)',
                borderLeft: `8px solid ${C.teal}`,
                fontSize: 36,
              }}
            >
              <span style={{ color: C.muted }}>{s.n}</span>
              <span style={{ fontWeight: 600 }}>{s.rank}</span>
            </div>
          ))}
          <div style={{ ...useReveal(L(1) + 200), fontSize: 28, color: C.cream, marginTop: 18 }}>Keksa sipohiyning oyligi saqlangan</div>
        </div>
      </Pad>
    </Shell>
  );
};

/** 8. Zamondosh manbalar */
export const SourcesScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  const cards = [
    {
      at: L(0),
      name: 'Rui Gonsales de Klavixo',
      role: 'Kastiliya elchisi',
      note: '«Samarqandga — Amir Temur saroyiga sayohat kundaligi», 1403–1406',
      accent: C.gold,
    },
    {
      at: L(1),
      name: 'Ibn Arabshoh',
      role: 'Damashqlik tarixchi, 1389–1450',
      note: '«Temur tarixida taqdir ajoyibotlari». Salbiy munosabat, lekin fazilatlarini ham tan olgan',
      accent: C.teal,
    },
  ];
  return (
    <Shell scene={scene}>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Manbalar</Eyebrow>
          <Heading size={72}>Zamondoshlar nigohi</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', gap: 40 }}>
          {cards.map((c) => (
            <div
              key={c.name}
              style={{
                ...useReveal(c.at),
                flex: 1,
                padding: '38px 44px',
                borderRadius: 24,
                background: 'rgba(10,26,47,0.82)',
                borderTop: `8px solid ${c.accent}`,
              }}
            >
              <div style={{ fontFamily: serif, fontSize: 52, fontWeight: 900 }}>{c.name}</div>
              <div style={{ fontSize: 32, color: c.accent, margin: '8px 0 20px' }}>{c.role}</div>
              <div style={{ fontSize: 30, color: C.muted, lineHeight: 1.4 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </Pad>
    </Shell>
  );
};

/** 9. Oxirgi yurish va vafot */
export const FinaleScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  return (
    <Shell scene={scene} flip>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Oxirgi yurish</Eyebrow>
          <Heading size={72}>Xitoy yurishi va vafot</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'space-between' }}>
          <Stat at={L(0)} to={200000} format label="kishilik qo‘shin" sub="1404-yil 27-noyabr" width={560} size={130} />
          <Stat at={L(1)} to={1405} count={false} label="O‘trorda vafot etdi" sub="18-fevral" width={440} size={130} />
          <Stat at={L(1) + 150} to={27} label="mamlakat va o‘lka" sub="35 yillik yurishlar natijasi" width={520} size={130} />
        </div>
      </Pad>
    </Shell>
  );
};

/** 10. Jahon e'tirofi */
export const LegacyScene: React.FC<SceneProps> = ({ scene }) => {
  const L = (i: number) => scene.lines[i].start;
  const works = [
    { year: '1588', who: 'K. Marlou', what: 'tarixiy pyesa' },
    { year: '1724', who: 'G. Gendel', what: 'opera' },
    { year: '1827', who: 'E. Po', what: 'she’riy doston' },
  ];
  return (
    <Shell scene={scene}>
      <Pad>
        <div style={useReveal(0)}>
          <Eyebrow>Jahon e’tirofi</Eyebrow>
          <Heading size={72}>Madaniyatdagi iz</Heading>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', gap: 28 }}>
          {works.map((w, i) => (
            <div
              key={w.year}
              style={{
                ...useReveal(L(0) + i * 100),
                flex: 1,
                padding: '26px 30px',
                borderRadius: 20,
                background: 'rgba(10,26,47,0.8)',
                border: '2px solid rgba(217,173,85,0.4)',
              }}
            >
              <div style={{ fontFamily: serif, fontSize: 64, fontWeight: 900, color: C.gold }}>{w.year}</div>
              <div style={{ fontSize: 38, fontWeight: 600 }}>{w.who}</div>
              <div style={{ fontSize: 30, color: C.muted }}>{w.what}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'space-around' }}>
          <Stat at={L(1)} to={700} suffix="+" label="asar Yevropa tillarida" sub="2000-yilgacha chop etilgan" width={640} size={150} />
          <Stat at={L(1) + 150} to={1996} count={false} label="Amir Temur yili" sub="Parijda YUNESKO anjumani" width={640} size={150} />
        </div>
      </Pad>
    </Shell>
  );
};

/** 7. Yakun */
export const OutroScene: React.FC<SceneProps> = ({ scene }) => {
  const { width } = useVideoConfig();
  const L = (i: number) => scene.lines[i].start;
  return (
    <Shell scene={scene} light>
      <div style={{ position: 'absolute', left: 0, width, top: 190, textAlign: 'center' }}>
        <div style={useReveal(L(0))}>
          <div style={{ fontFamily: serif, fontSize: 130, fontWeight: 900, color: C.gold, textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}>
            Kuch — adolatda
          </div>
        </div>
        <div style={{ ...useReveal(L(0) + 20), fontSize: 36, color: C.cream, marginTop: 14 }}>Davlat bayrog‘idagi ibora (L. Keren)</div>
        <div
          style={{
            ...useReveal(L(1)),
            margin: '60px auto 0',
            width: 1200,
            padding: '30px 40px',
            borderRadius: 24,
            background: 'rgba(10,26,47,0.8)',
            fontSize: 44,
            lineHeight: 1.35,
          }}
        >
          Ibn Arabshoh va Klavixo Amir Temurni qanday baholagan?
          <div style={{ color: C.teal, marginTop: 10 }}>Manbalarni taqqoslang.</div>
        </div>
      </div>
      <div style={{ ...useReveal(L(1) + 30), position: 'absolute', bottom: 200, width, textAlign: 'center', fontSize: 30, color: C.gold, letterSpacing: 4 }}>
        DIGITAL HISTORY TEACHER
      </div>
    </Shell>
  );
};
